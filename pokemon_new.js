var pokeSchema = new mongoose.Schema({
        name: String,
        nature: String,
        type: String
    });
    
    var pokemon = mongoose.model('Pokemon', pokeSchema);
    var new_pokemon = new pokemon({name: pokemon[0], nature: pokemon[1], type: pokemon[2] });