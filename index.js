require('dotenv').config(); // this loads the defined variables from .env
const { t } = require('typy');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const navSvc = require('./app/services/NavigatorService');
const adminSvc = require('./app/services/AdministrationService');
const searchSvc = require('./app/services/SearchService');

/**
 * Workflow to migrate a FNT-Command Device-Type to another type (Type-Change)
 *
 * 1. Check if Source Typ exists
 * 2. Check Target Type exists
 * 3. Check if Target type is a valid changetype for source-type
 * 4. Get all devices of type source-type
 * 5. perform type-change for every single device
 *
 */
async function executeWorkflow(sourceTypeName,targetTypeName){

    try {
        console.log('Change '+sourceTypeName+' to ' + targetTypeName);
        //Check if source type exists
        let devTypeSources = await adminSvc.searchDeviceTypeByName(sourceTypeName);
        if (devTypeSources.length != 1){
            throw new Error('Source Type '+sourceTypeName+' not found');
        }
        let devTypeSource = devTypeSources[0];

        //Check if target type exists
        let devTypeTargets = await adminSvc.searchDeviceTypeByName(targetTypeName);
        if (devTypeTargets.length != 1){
            throw new Error('Target Type '+targetTypeName+' not found');
        }
        let devTypeTarget = devTypeTargets[0];
        let devTypeTargetElid = devTypeTarget['svispc_device_admin_search:infos']
        //console.log(devTypeTargetElid);

        //get changetypes for source
        let changeTypes = await adminSvc.getChangeTypes(devTypeSource['svispc_device_admin_search:infos']);

        let changeTypeFound = changeTypes.find(el => el == devTypeTargetElid);
        if (!t(changeTypeFound).isDefined){
            throw new Error('Target Type '+targetTypeName+' is not a valid changetype for '+sourceTypeName );

        }
        //console.log(changeTypeFound);

        //get all devices with source type

        let devicesToChange = await searchSvc.searchDeviceByType(sourceTypeName);
        console.log('Found '+devicesToChange.length+' devices to change');
        devicesToChange.forEach(device => {

            navSvc.changeObjectType(device['cisearch_dynamic:infos'],devTypeTargetElid).then(res => {
                console.log('Change device-type for ' + device['cisearch_dynamic:id'] + ' successful');
                //console.log('Success');
            }).catch((err) => {
                console.error('Failed to change device-type for ' + device['cisearch_dynamic:id']);
                console.error(err);
            });

        });

    } catch (e){
        console.log(e);
    }

}

//Noch offen, da geplante SFPS vorhanden
//executeWorkflow('FO-ARISTA-SFP-10G-SR','FO-UNI-SFP-10G-SR');
//Noch offen, da geplante SFPS vorhanden
//executeWorkflow('FO-INTEL-SFP-10G-LX','FO-UNI-SFP-10G-SR');

executeWorkflow('FO-UNCODED-SFP-10G-SR','FO-UNI-SFP-10G-SR');

