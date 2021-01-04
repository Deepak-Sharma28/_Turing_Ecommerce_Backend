const jwt = require('jsonwebtoken');
const confiq = require('../knexfile').development;
const knex = require('knex')(confiq);


module.exports = (req, res, next) => {


    const token = req.headers.authorization;
    console.log(token);

    if (token !== undefined) {

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {

            if (!err) {
                knex('customer').havingIn('email', decoded)
                    .then(customerData => {
                        if (customerData) {
                            console.log(decoded);
                            req.customerInfo = customerData;
                            next();
                        }
                    })
                    .catch(err => {
                        res.send(err);
                    });
            } else {
                res.send(err);
            }
        });
    } else {
        res.send("please login first");
    }
};