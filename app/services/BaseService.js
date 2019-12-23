require('dotenv').config(); // this loads the defined variables from .env
const { t } = require('typy');

var soap = require('soap');

class ApiError extends Error {
  constructor(message) {
    super(message);
   // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
   // This clips the constructor invocation from the stack trace.
   // It's not absolutely essential, but it does make the stack trace a little nicer.
   //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

class BaseService {

    constructor(wsName){

        this.wsdlUrl = process.env.WS_BASE_URL + wsName + "?wsdl";
        this.sessionId = process.env.WS_SESSION_ID;
        var options = {
            envelopeKey: 'soapenv'
        };

        this.client = soap.createClientAsync(this.wsdlUrl,options);

    }

    createStringAttribute(value){
        return {

                attributes: {'xsi:type':'xsd:string'},
                $value: value
        };
    }

    createIntAttribute(value){
        return {

                attributes: {'xsi:type':'xsd:int'},
                $value: value
        };
    }

    createBooleanAttribute(value){
        return {

                attributes: {'xsi:type':'xsd:boolean'},
                $value: value
        };
    }


    getSessionIdAttribute(){

        return this.createStringAttribute(this.sessionId);
    }

    parseFormResponse(response,responseType){

        let parsed = this.parseResponse(response,responseType);
        return parsed.form.data;

    }

    /**
     * Return an ArrayList of Objects from a Command Data-Response with bindings
     *
     *
     * @param {*} response
     * @param {*} responseType
     */
    parseDataResponse(response,responseType){

        let parsed = this.parseResponse(response,responseType);
        if (!t(parsed,'data.binding').isArray ){
            throw new Error("Malformed Data-Response");
        }
        //check if any elements were returned
        if (!t(parsed,'data.binding[0].item').isDefined ){
            return [];
        }

        var data = [];
        //only one item ?
        if (!t(parsed,'data.binding[0].item').isArray ){
            var item = {};

            for (let j=0;j<parsed.data.binding.length;j++){
                if (t(parsed.data.binding[j].item).isDefined){
                    item[parsed.data.binding[j].attributes.name] = parsed.data.binding[j].item.attributes.value;
                } else {
                    item[parsed.data.binding[j].attributes.name] = null;
                }
            }
            data.push(item);
            return data;

        }

        //get number of elements
        let numElements = parsed.data.binding[0].item.length;

        //for every element

        for (let i=0;i<numElements;i++){
            var item = {};
            //get every binding = attribute
            for (let j=0;j<parsed.data.binding.length;j++){
                if (t(parsed.data.binding[j].item).isArray){
                    if (t(parsed.data.binding[j].item[i]).isDefined){
                        item[parsed.data.binding[j].attributes.name] = parsed.data.binding[j].item[i].attributes.value;
                    } else {
                        item[parsed.data.binding[j].attributes.name] = null;
                    }
                }
            }
            data.push(item);

        }
        //console.log(data);
        return data;

    }

    parseResponse(response,responseType){

        //console.debug(response);

        if (response.length>=1){
            if (response[0].hasOwnProperty(responseType)){
                //console.log(JSON.stringify(response[0][responseType]));
                let apiResponse = response[0][responseType];
                if (apiResponse.hasOwnProperty('message')){
                    //console.log(apiResponse.message.attributes);
                    throw new ApiError(apiResponse.message.attributes.msgtxt);
                }

                /*
                if (apiResponse.hasOwnProperty('data')){
                    //console.log(apiResponse.data);
                    return apiResponse.data;
                }*/
                return apiResponse;

            }
        }
        console.log("Malformed Response");
        throw new Error("Malformed Response");
    }



}

module.exports = BaseService;