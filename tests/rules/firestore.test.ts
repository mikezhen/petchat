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

// ─── field-size limits ──────────────────────────────────────────────────────

describe('field-size limits', () => {
  const bigText = (n: number) => 'x'.repeat(n)

  it('rejects a pet with an over-long name', async () => {
    const db = asUser('alice')
    await assertFails(setDoc(doc(db, 'pets', 'pet-x'), {
      ownerId: 'alice', name: bigText(101), status: 'active',
    }))
  })

  it('rejects a pet with an over-long description', async () => {
    const db = asUser('alice')
    await assertFails(setDoc(doc(db, 'pets', 'pet-x'), {
      ownerId: 'alice', name: 'Max', status: 'active', description: bigText(2001),
    }))
  })

  it('rejects a pet update with over-long medical notes', async () => {
    await seedPet('pet-1', 'alice')
    const db = asUser('alice')
    await assertFails(updateDoc(doc(db, 'pets', 'pet-1'), { medicalNotes: bigText(5001) }))
  })

  it('rejects a pet with too many contacts', async () => {
    const db = asUser('alice')
    await assertFails(setDoc(doc(db, 'pets', 'pet-x'), {
      ownerId: 'alice', name: 'Max', status: 'active', contacts: [1, 2, 3, 4, 5, 6],
    }))
  })

  it('allows a pet whose text is exactly at the limit', async () => {
    const db = asUser('alice')
    await assertSucceeds(setDoc(doc(db, 'pets', 'pet-ok'), {
      ownerId: 'alice', name: 'Max', status: 'active', description: bigText(2000),
    }))
  })

  it('rejects a user with an over-long full name', async () => {
    const db = asUser('alice')
    await assertFails(setDoc(doc(db, 'users', 'alice'), {
      fullName: bigText(101), email: 'a@b.com',
    }))
  })
})

// ─── pets/{petId}/scanEvents ────────────────────────────────────────────────

describe('pets/{petId}/scanEvents', () => {
  // The rules require the document ID to be the current minute bucket.
  const bucketId = () => String(Math.floor(Date.now() / 60000))

  describe('creates (rate-limited by time-bucket ID)', () => {
    it('allows a scan event written to the current-minute bucket ID', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertSucceeds(
        setDoc(doc(db, 'pets', 'pet-1', 'scanEvents', bucketId()), {
          scannedAt: new Date(),
          latitude: null,
          longitude: null,
          userAgent: 'test',
        })
      )
    })

    it('rejects a scan event with a non-bucket (random) document ID', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertFails(
        setDoc(doc(db, 'pets', 'pet-1', 'scanEvents', 'arbitrary-id'), {
          scannedAt: new Date(),
          latitude: null,
          longitude: null,
        })
      )
    })

    it('rejects a scan event for a non-existent pet', async () => {
      const db = asGuest()
      await assertFails(
        setDoc(doc(db, 'pets', 'ghost-pet', 'scanEvents', bucketId()), {
          scannedAt: new Date(),
          latitude: null,
          longitude: null,
        })
      )
    })

    it('rejects a second write to the same minute bucket (rate limit)', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      const id = bucketId()
      await assertSucceeds(
        setDoc(doc(db, 'pets', 'pet-1', 'scanEvents', id), {
          scannedAt: new Date(), latitude: null, longitude: null, userAgent: 'test',
        })
      )
      // Same ID again within the minute is an update, which is denied.
      await assertFails(
        setDoc(doc(db, 'pets', 'pet-1', 'scanEvents', id), {
          scannedAt: new Date(), latitude: 1, longitude: 1, userAgent: 'test',
        })
      )
    })

    it('rejects a scan event with unexpected extra fields', async () => {
      await seedPet('pet-1', 'alice')
      const db = asGuest()
      await assertFails(
        setDoc(doc(db, 'pets', 'pet-1', 'scanEvents', bucketId()), {
          scannedAt: new Date(), latitude: null, longitude: null, evil: 'x'.repeat(100000),
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
