//Requires
const modulename = 'WebServer:Dashboard';
const semver = require('semver');
const { dir, log, logOk, logWarn, logError} = require('../extras/console')(modulename);


/**
 * Returns the output page containing the Dashboard (index)
 * @param {object} ctx
 */
module.exports = async function Dashboard(ctx) {
    //If the any FXServer configuration is missing
    if(globals.fxRunner.config.serverDataPath === null || globals.fxRunner.config.cfgPath === null){
        return ctx.response.redirect('/setup');
    }

    //Shortcut function
    let getPermDisable = (perm) => {
        return (ctx.utils.checkPermission(perm, modulename, false))? '' : 'disabled'
    }

    //Preparing render data
    let renderData = {
        serverName: globals.config.serverName,
        updateData: getUpdateData(),
        chartData: getChartData(globals.monitor.timeSeries.get()),
        perms:{
            commandMessage: getPermDisable('commands.message'),
            commandKick: getPermDisable('commands.kick'),
            commandResources: getPermDisable('commands.resources'),
            controls: getPermDisable('control.server'),
            controlsClass: (ctx.utils.checkPermission('control.server', modulename, false))? 'danger' : 'secondary'
        }
    }


    //Rendering the page
    return ctx.utils.render('dashboard', renderData);
};


//================================================================
/**
 * Process player history and returns the chart data or false
 * @param {array} series
 */
function getChartData(series) {
    if (series.length < 360) {
        return false;
    }

    //TODO: those are random values, do it via some calculation to maintain consistency.
    let mod;
    if (series.length > 6000) {
        mod = 32;
    } else if (series.length > 2000) {
        mod = 18;
    } else {
        mod = 6
    }

    let chartData = [];
    for (let i = 0; i < series.length; i++) {
        if (i % mod === 0) {
            chartData.push({
                t: series[i].timestamp * 1000,
                y: series[i].value.toString()
            });
        }
    }

    return JSON.stringify(chartData);

}


//================================================================
/**
 * Returns the update data
 */
function getUpdateData() {

    let updateData;
    try {
        // xxxxx
        dir(globals.databus.updateChecker);
    } catch (error) {
        logError(`Error while processing changelog. Enable verbosity for more information.`);
        if(GlobalData.verbose) dir(error);
    }

    return updateData;
}
