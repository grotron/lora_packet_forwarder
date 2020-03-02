require('getmac').getMac({iface: 'eth0'}  ,function(err, macAddress){
    if (err)  throw err
    macAddr = macAddress.replace(/:/g,'');
    console.log(macAddr);
})

