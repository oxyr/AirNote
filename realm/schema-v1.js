const userSchema = {
  name: "userSchema",
  properties: {
    _id: "int",
    name: "string?",
    avatar: "string?",
    user_id: "string?"
  }
};
const stringSchema = {
  name: "stringSchema",
  properties: {
    value: "string"
  }
};
const doubleSchema = {
  name: "doubleSchema",
  properties: {
    value: "double"
  }
};
const intSchema = {
  name: "intSchema",
  properties: {
    value: "int"
  }
};

const NoteInfoSchema = {
  name: "NoteInfoSchema",
  primaryKey: "id",
  properties: {
    id: "string",
    name: "string?",
    title: "string?",
    content: "string?",
    lastTime: "date?",
    createTime: "date?",
  }
};

module.exports = {
  schema: [
    NoteInfoSchema,
    userSchema,
    stringSchema,
    doubleSchema,
    intSchema
  ],
  schemaVersion: 1,
  migration: () => {}
};
