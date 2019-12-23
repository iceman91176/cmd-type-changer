require('dotenv').config(); // this loads the defined variables from .env

BaseService = require('./BaseService');

var soap = require('soap');

class SearchService extends BaseService {

    constructor(){
        super('GlobalSearchWS');
        /*
        this.client.then(client => {
            console.log(client);
        })*/
    }



    searchDeviceByType(typeName){

        var args = {
            sessionId : this.getSessionIdAttribute(),
            module : this.createStringAttribute('cisearch'),
            type : this.createStringAttribute('cisearch_default_device'),
            restrictions : {
                attributes: {'xsi:type':'xsd:XML'},
                $xml: '<data allRequiredFilled="true"><binding type="text" name="cisearch_dynamic:fa_type__varchar|1:or_group_10318:1" restriction="=" value="'+typeName+'"  /><binding name="cisearch_dynamic:id__varchar|1:or_group_980011:1" value="" restriction="=" /><binding name="cisearch:zonechooser_enabled" type="" value="N" /><binding name="cisearch:union" value="N" /><binding  name="cisearch:classes"><item  value="STCDEV_DEVICE"  /><item  value="STCDEV_MODULE" /></binding><binding type="text" name="cisearch:classification" icon="" value="611BGI14K70GP9"/></data>'
            },
            caseSensitive : this.createBooleanAttribute(false),
            maxResults : this.createIntAttribute(500)
        };

        return this.client.then((client) => {
            return client.searchObjectsAsync(args);
        }).then((result) => {

            try {

                //console.log(result[0].getEditDataReturn);
                let resp = this.parseDataResponse(result,"searchObjectsReturn");
                return Promise.resolve(resp);
            } catch (ex) {
                if(ex.name =='ApiError'){
                    return Promise.reject({'successful':false,"errmsg":ex.message});
                }
                return Promise.reject({'successful':false,"errmsg":ex.toString()});
            }
            //console.log(result[0]['getTimestampReturn']);
        });




    }



}

module.exports = new SearchService();