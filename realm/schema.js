import schema_v1 from './schema-v1'
class Schema{
    schema:Array<any>;

    constructor(){
        this.schema = [schema_v1];
    }

    current(){
        return this.schema[this.schema.length-1];
    }
}

module.exports=Schema;