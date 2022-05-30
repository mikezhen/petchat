import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography
} from "@mui/material";
import PetProps from "../../interfaces/Pet";

function PetCard(props: PetProps) {
  return (
    <Card variant='outlined'>
      <CardContent>
        <Typography variant='h5' component='div'>
          { props.name }
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          { props.breed }
        </Typography>
        <CardMedia
          component='img'
          src={ props.imageUrl }
          alt='Pet picture'
        />
        <Typography variant='body2'>
          Born { `${props.birthday.toLocaleString('default', { month: 'long' })} ${props.birthday.getFullYear()}` }
        </Typography>
        <Typography variant='subtitle2'>
          { props.microchip ? 'Microchipped' : 'Not Microchipped' }
        </Typography>
        <Typography variant='subtitle2'>
          Veterinarian
          <Box sx={{ marginLeft: '2em' }}>
          { props.veterinarianAddress.name }
          <br />
          { props.veterinarianAddress.streetAddress1 }
          <br />
          { props.veterinarianAddress.addressLocality }, { props.veterinarianAddress.addressRegion } { props.veterinarianAddress.postalCode }
          </Box>
        </Typography>
        <Typography variant='body2'>
          { props.description }
        </Typography>
      </CardContent>
    </Card>
  )
}

export default PetCard;