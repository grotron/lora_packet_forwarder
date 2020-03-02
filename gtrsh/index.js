const ngrok = require('ngrok');
var request = require('request');
var config = require('./config');


var UserName = config.UserName;
var Password = config.Password;
var EndPoint = config.EndPoint;
var macAddr  = config.macAddr;

    
    
    async function setSecret() {
        
    }
   


setSecret()
        .then(function() {
		var URL="";
		var port;
		var action;
		var type='';

		
		var Token = config.Token;
		var topic = "fn/shell/"+macAddr;
		var topicPub = "fn/shell/handle/"+macAddr;

		
		console.log(macAddr);

		var mqtt = require('mqtt')
		const settings = {
			       		username: UserName,
			       		password: Password
			   	 };

		var client = mqtt.connect(EndPoint,settings);


		
		client.on("connect", subsMsg);

		async function subsMsg() {
			try {
				await client.subscribe(topic);
			    } catch (e){
			    }
		}


		client.on('message', function (topic, message) {
			try{
				console.log(message.toString());
				var JsonMsg = JSON.parse(message.toString())
				port = JsonMsg.port;
				type = JsonMsg.type;
				action = JsonMsg.action;
				var urlInner=''
				if(action==="start")
				{
					var alreadyPublished = false;
					var APIUrl ="http://localhost:4040/api/tunnels/";
					var request = require('sync-request');
					try{
						var resPro = request('GET', APIUrl);
						var arr = JSON.parse(resPro.getBody('utf8'));
						for(var i=0;i<arr.tunnels.length;i++)
						{
							if(type===arr.tunnels[i].proto && port===arr.tunnels[i].config.addr.split(':')[1])
							{
								console.log(arr.tunnels[i].public_url);
								urlInner=arr.tunnels[i].public_url;
								alreadyPublished=true;
							}
							
						}
					}catch(e){}
					
					
					if(urlInner!=='')
					{
						var msg={"url":urlInner};					
						client.publish(topicPub, JSON.stringify(msg));
					}	
					urlInner='';
					
					if(alreadyPublished===true)
					{
						return;
					}
					(async function() {
					  const url = await ngrok.connect({proto: type, addr: port, authtoken: Token});
					  	console.log(url);
						var clientPub = mqtt.connect(EndPoint,settings);
						clientPub.on("connect", publishMsg);
						async function publishMsg() {
				       			
						       	try {
								var msg={"url":url};
								await clientPub.publish(topicPub, JSON.stringify(msg));
						       	} catch (e){
						       	}
						}
					})();

				}
				else if(action==="stop")
				{	
					var APIUrl ="http://localhost:4040/api/tunnels/";
					var request = require('sync-request');
					var counter=0;

					try{
						var resPro = request('GET', APIUrl);
						var arr = JSON.parse(resPro.getBody('utf8'));
						if(arr.tunnels.length===2 && type==='http')
						{
							if(port===arr.tunnels[0].config.addr.split(':')[1])
							{
								console.log('Kill');
								ngrok.kill();
							}
						}	
						else
						{
							for(var i=0;i<arr.tunnels.length;i++)
							{
								if(	(
										type===arr.tunnels[i].proto 
										&& port===arr.tunnels[i].config.addr.split(':')[1]
									)
									||
									(
										type==='http' 
										&& arr.tunnels[i].proto==='https' 
										&& port===arr.tunnels[i].config.addr.split(':')[1]
									)
								)
								{
									counter++;
									if(arr.tunnels.length-counter===0)
									{
										console.log('Kill');
										ngrok.kill(); 
										
									}
									else
									{
										console.log('disconnect');
										ngrok.disconnect(arr.tunnels[i].public_url)
									}
								}
							}
						}
						
					}catch(e){}
					action='';
				}
				
			}catch(e){
			}
		})

        

	});

		



