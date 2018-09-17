
const path = require('path')
const Table = require('table-builder')
const url = require('url')


module.exports = (app, models, logger) => {
    app.get('/', (req, res) => {
        res.redirect(301, '/login')
    })

    app.get('/logout', (req, res) => {
        req.session.destroy()
        res.redirect(301, '/login')
    })

    app.get('/login', (req, res) => {
        res.sendFile(path.resolve('./client/login.html'))
    })

    app.post('/login', (req, res, next) => {
        const _email = String(req.body.email)
        const _password = String(req.body.password)
        const _username = String(req.body.username)

        models.admin.findOne({email: _email}, (err, admin) => {

            // if there are any errors, return the error
            if(err) next(err)

            if(!admin) next(new Error('User not found'))

            if(!admin.validPassword(_password)){
                res.redirect(301, '/login')
            }

            if(admin.validPassword(_password)){
                req.session.user = admin
                logger.info(`Successfully logined`)
                res.redirect(301, `/auth/main`)
            }
        })

    }, (err, req, res) => {
        if(err) console.log(err)
    })

    app.get('/register', (req, res) => {
        res.sendFile(path.resolve('./client/register.html'))
    })

    app.post('/register', (req, res, next) => {
        models.admin.findOne({email: req.body.email}, (err, admin) => {
            if(err) next(err)

            if(admin) next('Admin with the same email already exist')

            const newAdmin = new models.admin()
            newAdmin.username = req.body.username
            newAdmin.password = newAdmin.generateHash(req.body.password)
            newAdmin.email = req.body.email

            newAdmin.save(err => {
                if(err) next(err)
                logger.info(`${newAdmin} admin has been created`)
                res.redirect(301, '/login')
            })

        })
    }, (err, req, res) => {
        if(err) console.log(err)
    })

    app.get('/auth/main', isAuthenticated, (req, res) => {
        res.sendFile(path.resolve('./client/main.html'))
    })

    function isAuthenticated(req, res, next) {
        // Improvement: TODO authenctication token with expire time 
        if (req.session.user)
            return next()
      
        // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
        res.redirect('/login')
    }

    app.get('/auth/create-user', isAuthenticated, (req, res) => {
        res.sendFile(path.resolve('./client/create-user.html'))
    })

    app.post('/auth/create-user', isAuthenticated, (req, res, next) => {
        const _name = String(req.body.name)
        const _surname = String(req.body.surname)
        const _father = String(req.body.father)
        const _gender = (req.body.male == 'male')? 'male' : 'female'
        const _phone = Number(req.body.phone)
        const _price = Number(req.body.price)
        const _position = String(req.body.position)

        //TODO: protect from injection

        models.user.findOne({surname: _surname}, (err, user) => {
            // if there are any errors, return the error
            if(err) next(err)

            if(user) {
                res.redirect(301, '/auth/create-user')
            } 
            
            if(!user){
                const newUser = new models.user()
                newUser.name = _name
                newUser.surname = _surname
                newUser.father = _father
                newUser.gender = _gender
                newUser.phoneNumber = _phone
                newUser.price = _price
                newUser.position = _position
    
                newUser.save(err => {
                    if(err) next(err)
                    logger.info(`${newUser} user has been inserted`)
                    res.redirect(301, '/auth/main')
                })
            }
        })
    }, (err, req, res) => {
        if(err) {
            console.log(err)
        }
    })

    app.get('/auth/success', isAuthenticated, (req, res) => {
        res.sendFile(path.resolve('./client/success.html'))
    })

    app.get('/auth/main/table', isAuthenticated, (req, res, next) => {

        models.user.find({}, (err, result) => {

            if(err) next(err)

            result.forEach(element => {
                element.show = `<button class="show" id="${element.surname}">Show</button>`
                element.edit = `<button class="edit" id="${element.surname}" onclick="location.href='http://localhost:3022/auth/edit-user?surname=${element.surname}';">Edit</button>`
                element.remove = `<button class="remove" id="${element.surname}">Delete</button>`
            })

            const headers ={"show": "Show record",
                            "time": "Created time",
                            "name": "Name",
                            "surname": "Surname", 
                            "father": "By father",
                            "gender": "Gender of person",
                            "phoneNumber": "Phone number",
                            "price": "Price",
                            "position": "Position",
                            "edit": "Edit",
                            "remove": "Delete"}
            const mark = (new Table({'class': 'some-table'})).setHeaders(headers).setData(result).render()
            res.send(mark)
        })
    })

    app.get('/auth/user-info', isAuthenticated, (req, res, next) => {
        const _surname = req.query["surname"]
        models.user.findOne({surname: _surname}, (err, user) => {
            if(err) next(err)
            
            if(!user) res.send(null)
            else {
                res.send(user)
            }
        })
        
    })

    app.get('/auth/edit-user', isAuthenticated, (req, res, next) => {
        res.sendFile(path.resolve('./client/edit-user.html'))
    })

    app.post('/auth/edit-user', isAuthenticated, (req, res, next) => {
        const _name = String(req.body.name)
        const _surname = String(req.body.surname)
        const _father = String(req.body.father)
        const _gender = (req.body.male == 'on')? 'male' : 'female'
        const _phone = Number(req.body.phone)
        const _price = Number(req.body.price)
        const _position = String(req.body.position)

        models.user.findOne({surname: _surname}, (err, user) => {
            if(err) next(err)
            user.name = _name
            user.father = _father
            user.gender = _gender
            user.phoneNumber = _phone
            user.price = _price
            user.position = _position

            user.save(err => {
                if(err) next(err)
                res.redirect(301, '/auth/main')
            })
        })

    }, (err, res, req) => {
        if(err) console.log(err)
    })

    /**
     * Remove user from database via web interface
     */
    app.get('/auth/remove-user', isAuthenticated, (req, res, next) => {
        const _surname = req.query["surname"]
        models.user.deleteOne({surname: _surname}, (err, user) => {
            if(err) next(err)
            logger.info(`${_surname} user has been removed`)
            res.send("Success")
        })
    }, (err, req, res) => {
        if(err) console.log(err)
    })
      
}