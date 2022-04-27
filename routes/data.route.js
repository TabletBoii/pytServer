const {Router} = require("express")
const db = require('../dbConnection')
const router = Router()



router.get(
    '/pt/touragents/',
    async(req,res,next)=>{
      try{

      const touragentList = await db.query('SELECT touragentid, touragentname FROM touragents')

      res.send(
          touragentList.rows
      )
    }catch (e) {
      res.status(500).json({message:e})
    }
    next()
  }
)
router.get(
    '/pt/counties/',
    async(req,res,next)=>{
      try{

        const countryList = await db.query('SELECT countryid, countryname FROM countries')
        res.send(
            countryList.rows
        )
      }catch (e) {
        res.status(500).json({message:e})
      }
      next()
    }
)

router.post(
    '/pt/cities/',
    async(req,res)=>{
      try{
        const {request} = req.body

        const countryID = await db.query('SELECT countryid FROM countries WHERE countryname=$1', [request])


        const cityList = await db.query('SELECT cityid, cityname FROM cities WHERE countryid=$1', [countryID.rows[0].countryid])
        console.log(cityList.rows)
        res.send(
            cityList.rows
        )
      }catch (e) {
        res.status(500).json({message:e})
      }
    }
)

router.post(
    '/pt/searchTours',
    async (req, res) => {
      try{
        const { country, date } = req.body

        const searchQuery = await db.query('SELECT * FROM tours WHERE descountry=$1 AND tourbegdate=$2', [country, date])
        if(searchQuery.rows.length===0){
          return res.json({message: 'Туры по вашему запросу не найдены'})
        }

        return res.json({searchQuery})
      }catch (e){
        res.status(500).json({message: e.message})
      }
    }
)

router.post(
    '/pt/app',
    async (req, res) => {
      try{
        const {firstname, secondname, patronymic, address, selectedDate, telephone} = req.body

        const middle = await db.query('SELECT * FROM clients WHERE firstname=$1 AND secondname=$2 AND patronymic=$3', [firstname, secondname, patronymic])
        if(middle.rows.length!=0){
          return res.status(409).json({message:'Такой пользователь уже существует'})
        }


        const client = await db.query('INSERT INTO clients(firstname, secondname, patronymic, clientaddress, birthdate, telephone) VALUES($1, $2, $3, $4, $5, $6) RETURNING clientid',
            [firstname, secondname, patronymic, address, selectedDate, telephone]
            )

        await db.query('INSERT INTO applications(clientid) VALUES($1)', [client.rows[0].clientid])
        return res.status(201).json({message: 'Client successfully added'})
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.get(
    '/pt/tours',
    async (req, res) => {
      try{
        const tourResult = await db.query('SELECT tourname FROM tours')

        if(tourResult.rows.length===0){
          return res.json({message: 'Туры по вашему запросу не найдены'})
        }

        const result = tourResult.rows

        res.send(result)
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.get(
    '/admin/touragent-list',
    async (req, res) => {
      try{
        const tourAgentsResult = await db.query('SELECT * FROM touragentList')

        if(tourAgentsResult.rows.length===0){
          return res.json({message: 'Турагенты по вашему запросу не найдены'})
        }

        const result = tourAgentsResult.rows

        res.send(result)
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.get(
    '/admin/hotel-list',
    async (req, res) => {
      try{
        const hotelsResult = await db.query('SELECT * FROM hotel_list')

        if(hotelsResult.rows.length===0){
          return res.json({message: 'Турагенты по вашему запросу не найдены'})
        }

        const result = hotelsResult.rows

        res.send(result)
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.get(
    '/admin/tour-list',
    async (req, res) => {
      try{
        const toursResult = await db.query('SELECT * FROM tour_list')

        if(toursResult.rows.length===0){
          return res.json({message: 'Турагенты по вашему запросу не найдены'})
        }

        const result = toursResult.rows

        res.send(result)
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.get('/admin/applicationList', async (req, res)=>{
  try{
    const applicationList = await db.query('SELECT * FROM clients')
    console.log(applicationList.rows)
    res.send(
        applicationList.rows
    )
  }catch (e) {
    return res.status(500).json({message: e.message})
  }
})

router.post(
    '/admin/addTouragent',async (req, res) => {
      try{
        const { tourAgentName, contactTelephone, degOfTrust, countryValue, cityValue, addressName } = req.body

        const tourAgentsResult = await db.query('SELECT * FROM touragents WHERE touragentname=$1', [tourAgentName]).catch(e=>console.error(e))
        if(tourAgentsResult.rows.length>0){
          return res.status(409).json({message: 'Такой турагент уже существует'})
        }
        console.log(tourAgentsResult.rows)
        const countryResult = await db.query('SELECT * FROM countries WHERE countryname=$1', [countryValue]).catch(e=>console.error(e))
        if(countryResult.rows.length===0){
          return res.status(404).json({message:'Указанная страна недоступна'})
        }

        const cityResult = await db.query('SELECT * FROM cities WHERE cityname=$1', [cityValue]).catch(e=>console.error(e))
        if(cityResult.rows.length===0){
          return res.status(404).json({message: 'Указанный город недоступен'})
        }
        const selectedCity = await db.query('SELECT cityid FROM cities WHERE cityname=$1', [cityValue])
        const selectedCountry = await db.query('SELECT countryid FROM countries WHERE countryname=$1', [countryValue])


        try{
          await db.query('INSERT INTO touragents(touragentname, contacttelephone, degoftrust, country, city, address) VALUES($1, $2, $3, $4, $5, $6)',[tourAgentName, contactTelephone, degOfTrust, selectedCountry.rows[0].countryid, selectedCity.rows[0].cityid, addressName])
        }
        catch (e) {
          return res.status(500).json({message: e.message})
        }

        return res.status(201).json({message: 'Touragent successfully added'})
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.post(
    '/admin/deleteTouragent',async (req, res) => {
      try{
        const { touragentid } = req.body
        console.log(touragentid)
        await db.query('DELETE FROM tours WHERE $1 IN (SELECT touragentid FROM touragents)', [touragentid]).catch(e=>console.error(e))
        await db.query('DELETE FROM touragents WHERE touragentid=$1', [touragentid])

        return res.status(201).json({message: 'Touragent successfully deleted'})
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.post(
    '/admin/addHotel',async (req, res) => {
      try{
        const { hotelName,
          hotelPrice,
          hotelDescription,
          hotelGrade,
          countryValue,
          cityValue,
          hotelAddress,
          hotelTourName
        } = req.body
        console.log(req.body)

        const hotelResult = await db.query('SELECT * FROM hotels WHERE hotelname=$1', [hotelName]).catch(e=>console.error(e))
        if(hotelResult.rows.length>0){
          return res.status(409).json({message: 'Такой отель уже существует'})
        }
        console.log(hotelResult.rows)
        const countryResult = await db.query('SELECT * FROM countries WHERE countryname=$1', [countryValue]).catch(e=>console.error(e))
        if(countryResult.rows.length===0){
          return res.status(404).json({message:'Указанная страна недоступна'})
        }

        const cityResult = await db.query('SELECT * FROM cities WHERE cityname=$1', [cityValue]).catch(e=>console.error(e))
        if(cityResult.rows.length===0){
          return res.status(404).json({message: 'Указанный город недоступен'})
        }

        const tourResult = await db.query('SELECT * FROM tours WHERE tourname=$1', [hotelTourName]).catch(e=>console.error(e))
        if(cityResult.rows.length===0){
          return res.status(404).json({message: 'Указанный тур недоступен'})
        }
        const selectedCity = await db.query('SELECT cityid FROM cities WHERE cityname=$1', [cityValue])
        const selectedCountry = await db.query('SELECT countryid FROM countries WHERE countryname=$1', [countryValue])
        const selectedTour = await db.query('SELECT tourid FROM tours WHERE tourname=$1', [hotelTourName])



        try{
          await db.query('INSERT INTO hotels(hotelname, hotelprice, hoteldescription, hotelgrade, cityid, countryid, address, tourid) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',[hotelName, hotelPrice, hotelDescription,hotelGrade, selectedCity.rows[0].cityid,selectedCountry.rows[0].countryid, hotelAddress,selectedTour.rows[0].tourid])
        }
        catch (e) {
          return res.status(500).json({message: e.message})
        }

        return res.status(201).json({message: 'Touragent successfully added'})
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.post(
    '/admin/deleteHotel',async (req, res) => {
      try{
        const { hotelid } = req.body
        console.log(hotelid)

        await db.query('DELETE FROM hotels WHERE hotelid=$1', [hotelid])

        return res.status(201).json({message: 'Touragent successfully deleted'})
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.post(
    '/admin/addTour',async (req, res) => {
      try{
        const { tourName,
          tourAgentName,
          tourDescription,
          tourBegDate,
          tourEndDate,
          countryValue,
          cityValue } = req.body
        console.log(req.body)

        const tourResult = await db.query('SELECT * FROM tours WHERE tourname=$1', [tourName]).catch(e=>console.error(e))
        if(tourResult.rows.length>0){
          return res.status(409).json({message: 'Такой тур уже существует'})
        }
        console.log(tourResult.rows)
        const countryResult = await db.query('SELECT * FROM countries WHERE countryname=$1', [countryValue]).catch(e=>console.error(e))
        if(countryResult.rows.length===0){
          return res.status(404).json({message:'Указанная страна недоступна'})
        }

        const cityResult = await db.query('SELECT * FROM cities WHERE cityname=$1', [cityValue]).catch(e=>console.error(e))
        if(cityResult.rows.length===0){
          return res.status(404).json({message: 'Указанный город недоступен'})
        }
        const selectedCity = await db.query('SELECT cityid FROM cities WHERE cityname=$1', [cityValue])
        const selectedCountry = await db.query('SELECT countryid FROM countries WHERE countryname=$1', [countryValue])


        const tourAgentResult = await db.query('SELECT touragentid FROM touragents WHERE touragentname=$1', [tourAgentName])

        try{
          await db.query('INSERT INTO tours VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7)',[tourName, tourAgentResult.rows[0].touragentid, tourBegDate,tourEndDate, tourDescription, selectedCity.rows[0].cityid,selectedCountry.rows[0].countryid]).catch(e=>console.error(e))
        }
        catch (e) {
          return res.status(500).json({message: e.message})
        }

        return res.status(201).json({message: 'Tour successfully added'})
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.post(
    '/admin/deleteTour',async (req, res) => {
      try{
        const { tourid } = req.body
        console.log(tourid)

        await db.query('DELETE FROM tours WHERE tourid=$1', [tourid])

        return res.status(201).json({message: 'Tour successfully deleted'})
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

router.get(
    '/admin/tour-list',
    async (req, res) => {
      try{
        const tourResult = await db.query('SELECT * FROM tour_list')

        if(tourResult.rows.length===0){
          return res.json({message: 'Турагенты по вашему запросу не найдены'})
        }

        const result = tourResult.rows

        res.send(result)
      }catch (e) {
        return res.status(500).json({message: e.message})
      }
    }
)

/*router.post(
    '/admin/pt/showApplications',
    async(req,res)=>{
      try{
        const sear
      }catch (e) {
        res.status(500).json({message: e.message})
      }
    }
)*/

module.exports = router