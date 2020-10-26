let _session = null;
let _fxTopic = null;

// get query params from url
let host = getQueryVariable("host") || "dynometer.eu.diffusion.cloud";

// update h1 title on the consumer.html page
document.getElementById("room-title").innerText = 'Live Machine Monitoring';

var useShift = false;

var chart = JSC.chart('chartDiv', {
	yAxis_formatString: 'n',
	xAxis_overflow: 'hidden',
	margin_right: 20,
	toolbar: {
	  margin: 5,
	  items: {
		'Shift Values': {
		  type: 'checkbox',
		  value: false,
		  tooltip: 'The shift option determines whether the first point in the series is removed when adding a new point.',
		  events: { change: shiftPoints_btnClick  }
		}
	  }
	},
	xAxis: { scale_type: 'time'  },
	series: [
	  {
		name: 'Fuerza',
		points: []
	  }
	]
  });

// Hook into the form's onsubmit callback. This will send updates to the fx topic in Diffusion.
let parametersForm = document.getElementById("parametersForm");
parametersForm.onsubmit = (evt) => {
	evt.preventDefault();
	
	let input = parametersForm.querySelector("[name='parameters']");
	let parameters = input.value;

	// define your fx stream: number of fx JSON packages and frequency of update
	_fxTopic = "Simulation/" + parameters + "/Data";
 
    // Connect to your Diffusion service, or leave this values and connect to our sandbox
    // Sign up to Diffusion Cloud and get your service up a running in a minute.
    diffusion.connect({
        host : host, // Use your Diffusion service or connect to our sandbox "kafkagateway.us.diffusion.cloud"
        principal : "user",
        credentials : "password"
    }).then(
        (session) => {
	    // now we have a session open to our Diffusion service.
        console.log("Connected to Diffusion Server!");
	    _session = session;

	    // Set up a stream to receive updates from the fx topic.
	    session.addStream(_fxTopic, diffusion.datatypes.json())
	        .on("value", displayMessage);

	    // Subscribe to the fx topic.
        session.select(_fxTopic);
        
        console.log("Sunscribed to: " + _fxTopic);
	
        },
        (err) => {
	        alert(err);
        }
    );
    
    // update h1 title on the consumer.html page
    document.getElementById("room-title").innerText = 'Listening for updates';
    
    return true;
};

// Display a fx values received by Diffusion
function displayMessage(topic, specification, newValue, oldValue) {
    
    let msg = newValue.get();

    if (_fxTopic == "Simulation/" + msg.Maquina + "/" + msg.Usuario + "/" + msg.Sesion.Tipo + "/Data") { // Workaround to the topic view issue https://manuscript.pushtechnology.com/f/cases/24032/Bug-subscribing-to-Topic-Views

        // insert messages in container
        let container = document.getElementById("messages");
        let entry = document.createElement("li");
        entry.classList.add("list-group-item");

        let header = document.createElement("strong");
        header.innerText = "Tiempo: " + msg.Serie.Tiempo;
	
        let content = document.createElement("p");
        content.innerText = "Velocidad: " + msg.Serie.Velocidad + "  |  Posicion: " + msg.Serie.Posicion + "  |  Fuerza: " + msg.Serie.Fuerza;

        entry.appendChild(header);
        entry.appendChild(content);
        container.appendChild(entry);

        // Scroll to bottom of container, to show latest message.
        container.scrollTop = container.scrollHeight - container.clientHeight;
        
        chart.series(0).points.add({  y:parseFloat(msg.Serie.Fuerza),  x:msg.Serie.Tiempo },{shift: useShift});
    }
}

function shiftPoints_btnClick(shiftVal) {
	useShift=shiftVal;
}

