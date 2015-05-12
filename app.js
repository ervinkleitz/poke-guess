//*****************************************//
//***** Author: Ervin Kleitz Gonzales *****//
//**** back-end of Poke Guess web app *****//
//*****************************************//

//global declarations
var express = require( 'express' ),
	request = require ( 'request' ),
	app = express(),
	bodyParser = require('body-parser'),
	pokedex = [],
	pokemonResponse = {},
	data, 
	randomPokemon, 
	chosenPokemon, 
	pokemonImgPath, 
	pokemonUri;

app.use( bodyParser.json() );

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.listen(8888);
console.log( 'Listening on Port 8888' );
//Gets list of all pokemon in database
request( 'http://pokeapi.co/api/v1/pokedex/1/', getData );

//***** POST requests *****//
app.post('/pokemon', getRandom );//post format from client: {alreadyShown: [array of shown pokemon]}
app.post( '/guess', isRight );//post format from client: {guess: userchoice, correct: rightpokemon}
//***** POST requests *****//

//Gets random pokemon and sends to client
function getRandom( req, res ){
	//Gets random Pokemon path, stores in a variable
	randomPokemon = pokedex[ Math.floor( Math.random() * pokedex.length ) ];
	//Gets Pokemon name
	chosenPokemon = randomPokemon[ 'name' ];
	//checks if pokemon has already been shown and calls getRandom if it has
	for( var i = 0; i < req.body.alreadyShown.length; i++ ){
		if ( req.body.alreadyShown[i] === chosenPokemon ) getRandom( req, res );
	}
	pokemonUri = randomPokemon[ 'resource_uri' ];
	//Gets Pokemon sprite path
	pokemonImgPath = 'http://pokeapi.co/media/img/' + pokemonUri.substring(15, pokemonUri.length - 1) + '.png';
	//adds pokemon to alredyShown array if it has not been shown
	//Sends random pokemon and its image path to array to be sent to player
	pokemonResponse.name = chosenPokemon; 
	pokemonResponse.path = pokemonImgPath;
	//server-side notifications
	console.log('Received data from /pokemon: ' + req.body.alreadyShown);
	console.log('Sending data to client: ' + JSON.stringify(pokemonResponse));
	
	res.send(JSON.stringify(pokemonResponse));
}

//Gets data and saves it into server
function getData( error, response, body ) {
	//Check for error
	if( error ){
    	return console.log('Error: ', error);
	}
	//Check for right status code
	if( response.statusCode !== 200 ){
    	return console.log('Invalid Status Code Returned:', response.statusCode);
    }
    //If all is well
	data = JSON.parse(body);
	//Puts all Pokemon name and paths into array pokedex
	pokedex = data[ 'pokemon' ];
	return true;
}

//Checks if player chose right
function isRight( req, res ){
	var userGuess = req.body.guess;
	var correctGuess = req.body.correct;
	if ( userGuess === correctGuess ) res.send(JSON.stringify(true));
	res.send(JSON.stringify(false));
}