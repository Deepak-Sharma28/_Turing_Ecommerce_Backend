module.exports = (knex, Router) => {

    //for getting shipping regions

    Router.get('/shipping/regions', (req, res) => {
        knex.select('*').from('shipping_region')
            .then(shipping_region => {
                res.send(shipping_region);
            }).catch(err => {
                res.send(err);
            });
    });

    //for getting shipping regions by shipping region id

    Router.get('/shipping/regions/:shipping_region_id', (req, res) => {
        knex.select('*').from('shipping_region')
            .where('shipping_region_id', req.params.shipping_region_id)
            .then(shipping => {
                if (shipping.length) {
                    res.send(shipping);
                } else {
                    res.sendStatus(404);
                }
            }).catch(err => {
                res.send(err);
            });
    });
};