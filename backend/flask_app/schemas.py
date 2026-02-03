from marshmallow import Schema, fields, validate, ValidationError

class SignupSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=150))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

class ProfileUpdateSchema(Schema):
    healthConditions = fields.String(load_default='')
    allergies = fields.String(load_default='')
    dietType = fields.String(load_default='general')
    ingredientsToAvoid = fields.String(load_default='')
