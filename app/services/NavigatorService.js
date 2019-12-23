require('dotenv').config(); // this loads the defined variables from .env
BaseService = require('./BaseService');

var soap = require('soap');

class NavigatorService extends BaseService {

    constructor(){
        super('NavigatorWS');
    }
    createBindingWithItems(attributes,value){

        return {
            attributes: attributes,
            $value : {
                'item' : {
                    attributes: {'value':value}
                }
            }
        }
    }

    changeObjectType(elid,targetTypeElid){

        let args = {
            sessionId : this.getSessionIdAttribute(),
            module : this.createStringAttribute('zone'),
            type : this.createStringAttribute('default'),
            deviceElid : this.createStringAttribute(elid),
            dataXml : {
                attributes: {'xsi:type':'xsd:Element'},
                $xml: '<data allRequiredFilled="true"><binding value="'+targetTypeElid+'" returnItems="true" type="text" name="svicba_object_type:type_elid"><item value="'+targetTypeElid+'" /></binding></data>'
            }
        };

        return this.client.then((client) => {
            return client.changeObjectTypeAsync(args);
        }).then((result) => {

            try {
            let resp = this.parseResponse(result,"changeObjectTypeReturn");
                return Promise.resolve(resp);
                //console.log(resp);
            } catch (ex) {
                if(ex.name =='ApiError'){
                    return Promise.reject({'successful':false,"errmsg":ex.message});
                }
                return Promise.reject({'successful':false,"errmsg":ex.toString()});
            }
        });


    }

    getTimestamp(elid){

        let args = {
            sessionId : this.getSessionIdAttribute(),
            module : this.createStringAttribute('zone'),
            elid : this.createStringAttribute(elid)
        };

        this.client.then((client) => {
            return client.getTimestampAsync(args);
        }).then((result) => {


            try {
            let resp = this.parseResponse(result,"getTimestampReturn");
            console.log(resp);
            } catch (ex) {
                console.log("Fehler");
            }

        });

    }


}
module.exports = new NavigatorService();