module.exports = (knex, Router, jwt, isVerify) => {


    //for getting a customer
    Router.get('/customers', isVerify, (req, res) => {
        delete req.customerInfo[0].password;
        res.send(req.customerInfo);
    });



    //Register a user


    Router.post('/customers', (req, res) => {
        knex.select('*').from('customer').where('email', req.body.email)
            .then(data => {
                if (data.length == 0) {

                    knex('customer').insert({
                            name: req.body.name,
                            email: req.body.email,
                            password: req.body.password
                        })
                        .then(customer => {
                            res.send({ success: "user has singed up successfully" });
                        })
                        .catch(err => {
                            res.send(err);
                        });
                } else {
                    res.send('your are already a user');
                }
            });

    });




    //login a user 


    Router.post('/customers/login', (req, res) => {
        console.log(req.body);

        knex
            .select('*')
            .from('customer')
            .where('email', req.body.email)
            .then(customer => {

                if (customer.length != 0) {

                    if (customer[0].password === req.body.password) {


                        const payload = req.body.email;
                        console.log(payload);

                        var token = jwt.sign(payload, process.env.SECRET_KEY);

                        res.json({
                            "customer": {
                                "schema": customer,
                            },
                            "accessToken": token
                        });
                    } else {
                        res.sendStatus(403);
                    }
                } else {
                    res.sendStatus(404);
                }
            })
            .catch(err => {
                res.send(err);
            });
    });



    //for updating customer's details

    Router.put('/customer', isVerify, (req, res) => {
        var customer_details = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            day_phone: req.body.day_phone,
            eve_phone: req.body.eve_phone,
            mob_phone: req.body.mob_phone
        };


        knex('customer').where('email', req.customerInfo[0].email).update(customer_details)
            .then(() => {
                res.send({ message: 'details has update' });
            }).catch(err => {
                res.send(err);
            });
    });



    //for updating address of customer


    Router.put('/customers/address', isVerify, (req, res) => {
        var customer_address = {
            address_1: req.body.address_1,
            address_2: req.body.address_2,
            city: req.body.city,
            region: req.body.region,
            postal_code: req.body.postal_code,
            country: req.body.country
        };

        knex('customer').update(customer_address).where('email', req.customerInfo[0].email)
            .then(() => {
                res.send({ message: "address has updated successfully" });
            })
            .catch(err => {
                res.send(err);
            });
    });


    //for updating credit card detail

    Router.put('/customers/creditCard', isVerify, (req, res) => {
        var credit_card = {
            credit_card: req.body.credit_card
        };

        knex('customer').update(credit_card).where('email', req.customerInfo[0].email)
            .then(() => {
                res.send({ message: "your credit card details has updated successfully:)" });
            })
            .catch(err => {
                res.send(err);
            });
    });
};