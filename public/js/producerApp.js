let _session = null;
let _fxTopic = "diffusion.dynasystem";

let timestamp = 0;
let force = 0;
let position = 0;
let speed = 0;

// get query params from url
let host = getQueryVariable("host") || "dynometer.eu.diffusion.cloud";

// update h1 title on the generator.html page
document.getElementById("room-title").innerText = 'Simulate Machine Data';

// Hook into the form's onsubmit callback. This will send updates to the fx topic in Diffusion.
let parametersForm = document.getElementById("parametersForm");
parametersForm.onsubmit = (evt) => {
	evt.preventDefault();
	
	let input1 = parametersForm.querySelector("[name='loop']");
	let loop = parseInt(input1.value);

	let input2 = parametersForm.querySelector("[name='frequency']");
	let frequency = parseInt(input2.value);

	// define your fx stream: number of fx JSON packages and frequency of update
	publishFX(loop, frequency, loop);
 
    return true;
};

// Connect to your Diffusion service, or leave this values and connect to our sandbox
// Sign up to Diffusion Cloud and get your service up a running in a minute.
diffusion.connect({
    host : host, // Use your Diffusion service or connect to our sandbox "dynometer.eu.diffusion.cloud"
    principal : "user",
    credentials : "password"
}).then(
    (session) => {
		// now we have a session open to our Diffusion service.
		console.log("Connected to Diffusion Server!");
		_session = session;

		// Create an fx topic with a JSON data type.
		session.topics.add(_fxTopic, diffusion.topics.TopicType.JSON);
    },
    (err) => {
		alert(err);
    }
);

function publishFX(loop, frequency, totalLoops) {
    setTimeout(() => {
		
		let machine, user, type, randomizer;
		
		randomizer = (Math.random()*10).toFixed(0);

		if (randomizer < 1) { machine = "001"; }
		else if (randomizer < 3) { machine = "002"; }
		else if (randomizer < 5) { machine = "003"; }
		else if (randomizer < 7) { machine = "004"; }
		else if (randomizer < 9) { machine = "005"; }
		else if (randomizer < 11) { machine = "006"; }
		
		machine = "001" // disable randomizer
		
		randomizer = (Math.random()*10).toFixed(0);

		if (randomizer < 1) { user = "001"; }
		else if (randomizer < 3) { user = "002"; }
		else if (randomizer < 5) { user = "003"; }
		else if (randomizer < 7) { user = "004"; }
		else if (randomizer < 9) { user = "005"; }
		else if (randomizer < 11) { user = "006"; }
		
		user = "005" // disable randomizer
		
		randomizer = (Math.random()*10).toFixed(0);

		if (randomizer < 5) { type = "Isometrico"; }
		else { type = "Isotonico"; }
		
		type = "Isometrico" // disable randomizer
		
		timestamp = timestamp + 0.01;
		force = force + Math.random();
		position = position + Math.random();
		speed = Math.random()*10;

		//_session.topicUpdate.createUpdateStream(_fxTopic, diffusion.datatypes.json()).set(
		_session.topicUpdate.set(_fxTopic, diffusion.datatypes.json(), 
					{
						Maquina: machine,
						Usuario: user,
						Sesion:
						{
							  Tipo: type,
							  Series: 10,
							  TiempoRecuperacion: 0,
							  Duracion: 6,
							  MinFuerza: 0,
							  MaxFuerza: 120
						},
						Serie: 
						{
							Repeticion: 1,
							Fase: "e",
							Tiempo: new Date().getTime(),
							Posicion: position.toFixed(2),
							Fuerza: force.toFixed(2),
							Velocidad: speed.toFixed(2),
							Trigger: 0,
							Nota: 0
						}
					}
		);
		
		//Tiempo: timestamp.toFixed(2),
		
		let percentage = 100 - (loop * 100 / totalLoops);
		// update h1 title on the generator.html page
		document.getElementById("room-title").innerText = 'Simulation in progress... ' + percentage.toFixed(0) + '%';
    
        if(loop > 1) {
            publishFX(loop - 1, frequency, totalLoops);
        } else {
			// update h1 title on the generator.html page
			document.getElementById("room-title").innerText = 'Simulation completed!';
		}
	}, frequency);
}
