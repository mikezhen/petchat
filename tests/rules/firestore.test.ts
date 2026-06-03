/**
 * Firestore security rules integration tests.
 * Requires the Firestore emulator running on localhost:8080.
 *
 * Start before running: firebase emulators:start --only firestore
 * Run via:              npm run test:rules
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc } from 'firebase/firestore'

const PROJECT_ID = 'pawcode-test'
let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

// ─── helpers ────────────────────────────────────────────────────────────────

function asUser(uid: string) {
  return testEnv.authenticatedContext(uid).firestore()
}

function asGuest() {
  return testEnv.unauthenticatedContext().firestore()
}

async function seedPet(petId: string, ownerId: string) {
  await testEnv.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), 'pets', petId), { ownerId, name: 'Buddy', status: 'active' })
  })
}

async function seedUser(uid: string) {
  await testEnv.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), 'users', uid), { fullName: 'Jane', email: 'jane@example.com' })
  })
}

// ─── users/{uid} ────────────────────────────────────────────────────────────

describe('users/{uid}', () => {
  it('owner can read their own document', async () => {
    await seedUser('alice')
    const db = asUser('alice')
    await assertSucceeds(getDoc(doc(db, 'users', 'alice')))
  })

  it('owner can write their own document', async () => {
    const db = asUser('alice')
    await assertSucceeds(setDoc(doc(db, 'users', 'alice'), { fullName: 'Alice', email: 'alice@example.com' }))
  })

  it('authenticated user cannot read another user\'s document', async () => {
    await seedUser('alice')
    const db = asUser('bob')
    await assertFails(getDoc(doc(db, 'users', 'alice')))
  })

  it('authenticated user cannot write another user\'s document', async () => {
    const db = asUser('bob')
    await assertFails(setDoc(doc(db, 'users', 'alice'), { fullName: 'Hacked' }))
  })

  it('unauthenticated user cannot read any user document', async () => {
    await seedUser('alice')
    const db = asGuest()
    await assertFails(getDoc(doc(db, 'users', 'alice')))
  })

  it('unauthenticated user cannot write any user document', async () => {
    const db = asGuest()
    await assertFails(setDoc(doc(db, 'users', 'alice'), { fullName: 'Ghost' }))
  })
})

// ─── pets/{petId} ───────────────────────────────────────────────────────────

describe('pets/{petId}', () => {
  describe('reads', () => {
    it('unauthenticated user can read any pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertSucceeds(getDoc(doc(db, 'pets', 'pet-1')))
    })

    it('authenticated non-owner can read any pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asUser('bob')
      await assertSucceeds(getDoc(doc(db, 'pets', 'pet-1')))
    })
  })

  describe('creates', () => {
    it('owner can create a pet with matching ownerId', async () => {
      const db = asUser('alice')
      await assertSucceeds(setDoc(doc(db, 'pets', 'pet-new'), { ownerId: 'alice', name: 'Max', status: 'active' }))
    })

    it('authenticated user cannot create a pet with a different ownerId', async () => {
      const db = asUser('bob')
      await assertFails(setDoc(doc(db, 'pets', 'pet-spoofed'), { ownerId: 'alice', name: 'Hack', status: 'active' }))
    })

    it('unauthenticated user cannot create a pet', async () => {
      const db = asGuest()
      await assertFails(setDoc(doc(db, 'pets', 'pet-guest'), { ownerId: '', name: 'Ghost', status: 'active' }))
    })
  })

  describe('updates', () => {
    it('owner can update their own pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asUser('alice')
      await assertSucceeds(updateDoc(doc(db, 'pets', 'pet-1'), { name: 'Buddy Updated' }))
    })

    it('non-owner cannot update another user\'s pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asUser('bob')
      await assertFails(updateDoc(doc(db, 'pets', 'pet-1'), { name: 'Hacked' }))
    })

    it('unauthenticated user cannot update a pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertFails(updateDoc(doc(db, 'pets', 'pet-1'), { name: 'Hacked' }))
    })
  })

  describe('deletes', () => {
    it('owner can delete their own pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asUser('alice')
      await assertSucceeds(deleteDoc(doc(db, 'pets', 'pet-1')))
    })

    it('non-owner cannot delete another user\'s pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asUser('bob')
      await assertFails(deleteDoc(doc(db, 'pets', 'pet-1')))
    })

    it('unauthenticated user cannot delete a pet', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertFails(deleteDoc(doc(db, 'pets', 'pet-1')))
    })
  })
})

// ─── pets/{petId}/scanEvents ────────────────────────────────────────────────

describe('pets/{petId}/scanEvents', () => {
  describe('creates', () => {
    it('unauthenticated user can write a scan event', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertSucceeds(
        addDoc(collection(db, 'pets', 'pet-1', 'scanEvents'), {
          scannedAt: new Date(),
          latitude: null,
          longitude: null,
        })
      )
    })

    it('authenticated non-owner can write a scan event', async () => {
      await seedPet('pet-1', 'alice')
      const db = asUser('bob')
      await assertSucceeds(
        addDoc(collection(db, 'pets', 'pet-1', 'scanEvents'), {
          scannedAt: new Date(),
          latitude: 32.7,
          longitude: -117.1,
        })
      )
    })
  })

  describe('reads', () => {
    it('owner can read their own pet\'s scan events', async () => {
      await seedPet('pet-1', 'alice')
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await addDoc(collection(ctx.firestore(), 'pets', 'pet-1', 'scanEvents'), { scannedAt: new Date() })
      })
      const db = asUser('alice')
      const snap = await assertSucceeds(
        getDoc(doc(collection(db, 'pets', 'pet-1', 'scanEvents'), 'any'))
      )
      void snap
    })

    it('non-owner cannot read scan events', async () => {
      await seedPet('pet-1', 'alice')
      const db = asUser('bob')
      await assertFails(
        getDoc(doc(collection(db, 'pets', 'pet-1', 'scanEvents'), 'any'))
      )
    })

    it('unauthenticated user cannot read scan events', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertFails(
        getDoc(doc(collection(db, 'pets', 'pet-1', 'scanEvents'), 'any'))
      )
    })
  })
})
