require('dotenv').config(); // this loads the defined variables from .env
const { t } = require('typy');
BaseService = require('./BaseService');

var soap = require('soap');

class AdministrationService extends BaseService {

    constructor(){
        super('AdministrationWS');
    }

    searchDeviceTypeByName(typeName){

        var args = {
            sessionId : this.getSessionIdAttribute(),
            module : this.createStringAttribute('device'),
            type : this.createStringAttribute('default'),
            restrictions : {
                attributes: {'xsi:type':'xsd:XML'},
                $xml: '<data allRequiredFilled="true"><binding  type="text" name="svispc_device_admin_search:type" restriction="=" value="'+typeName+'" /></data>'
            },
            caseSensitive : this.createBooleanAttribute(false),
            maxResults : this.createIntAttribute(200)
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

    getChangeTypes(elid){

        let args = {
            sessionId : this.getSessionIdAttribute(),
            module : this.createStringAttribute('device'),
            deviceElid : this.createStringAttribute(elid),
            type : this.createStringAttribute('card_graphic'),
            views : this.createStringAttribute('change_types'),
            dataXml : {
                attributes: {'xsi:type':'xsd:Element'}
            },
            planFlag : this.createBooleanAttribute(false)
        };

        return this.client.then((client) => {
            return client.getEditDataAsync(args);
        }).then((result) => {

            try {

                //console.log(result[0].getEditDataReturn);
                let resp = this.parseFormResponse(result,"getEditDataReturn");
                let filtered = resp.binding.find(b => (b.attributes.name == 'svispc_device_admin_search:change_type_elid'));

                //Single result has to be handled differently
                if (!t(filtered,'item').isArray ){
                    return Promise.resolve([filtered.item.attributes.value]);
                }
                //Multiple results
                if (t(filtered,'item').isArray){
                    let changeTypes = filtered.item.map(b => b.attributes.value);
                    return Promise.resolve(changeTypes);
                }
                //No results
                return Promise.resolve([]);
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

module.exports = new AdministrationService();