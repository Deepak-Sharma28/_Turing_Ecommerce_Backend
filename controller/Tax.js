module.exports = (knex, Router) => {
    //for getting all the taxs

    Router.get('/tax', (req, res) => {
        knex.select('*').from('tax')
            .then(tax => {
                res.send(tax);
            })
            .catch(err => {
                res.send(err);
            });
    });

    //for getting tax by tax tax_id

    Router.get('/tax/:tax_id', (req, res) => {
        knex.select('*').from('tax').where('tax_id', req.params.tax_id)
            .then(tax => {
                if (tax.length) {
                    res.send(tax);
                } else {
                    res.sendStatus(404);
                }
            }).catch(err => {
                console.log(err);
                res.send(err);
            });
    });
};