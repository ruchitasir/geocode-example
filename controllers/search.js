let router = require('express').Router();
let db = require('../models');
require('@gouch/to-title-case')

const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding')
const geocodingClient = mbxGeocoding({accessToken: process.env.MAPBOX_TOKEN})

router.get('/',(req,res)=>{
    geocodingClient.forwardGeocode({
        query: `${req.query.city},${req.query.state}`
    })
    .send()
    .then(response=>{
        let match = response.body.features[0]

        console.log("match", match)
        console.log(match.center)
        res.render('show',{match, mapKey:process.env.MAPBOX_TOKEN, city:req.query.city, state:req.query.state})
    })
    .catch(err=>{
        console.log(err)
        res.send('Error',err)
    })

})

router.get('/fave',(req,res)=>{
    db.place.findAll()
    .then((favePlaces)=>{
        res.render('fave', {favePlaces})
    })
    .catch((err)=>{
        console.log('Error',err)
        res.render('error')
      })
   
})

router.post('/add',(req,res)=>{
    db.place.findOrCreate({
        where: {
          city: req.body.city.toLowerCase(),
          state: req.body.state.toLowerCase(),
          lat: req.body.lat,
          long: req.body.long
        }
    })
    .then(function([place, created]) {
        if(created){
            console.log('created a new fave with:', place)
        }else{
            console.log('record exists: ',req.body.city); // returns info about the user
        }
        res.redirect('/search/fave')
      })
      .catch(err=>{
        console.log("Error in post route",err)
        res.render('error')
      })
 
})

router.delete('/remove',(req,res)=>{
    db.place.destroy({
        where: { id: req.body.id }
      })
      .then(()=>{
          console.log('req.body in delete form',req.body)
           res.redirect('/search/fave')
      })
      .catch(err=>{
        console.log("Error in delete",err)
        res.render('error')
      }) 
   
})

/* geocodingClient.reverseGeocode({
    query: [-122.3301, 47.6038]
})
.send()
.then(response=>{
    let match = response.body
    console.log(match)
})

 */



//Export (allow me to include this in another page)
module.exports = router;