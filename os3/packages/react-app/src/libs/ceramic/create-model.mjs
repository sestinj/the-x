import { CeramicClient } from "@ceramicnetwork/http-client";
import { ModelManager } from "@glazed/devtools";
import { DID } from "dids";
import { writeFile } from "fs";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays";

// The key must be provided as an environment variable
const key = fromString(process.env.DID_KEY, "base16");
// Create and authenticate the DID
const did = new DID({
  provider: new Ed25519Provider(key),
  resolver: getResolver(),
});
await did.authenticate();

// Connect to the local Ceramic node
const ceramic = new CeramicClient("http://localhost:7007");
ceramic.did = did;

// Create a manager for the model
const manager = new ModelManager(ceramic);

const profileSchemaID = await manager.createSchema("Profile", {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Profile",
  type: "object",
  properties: {
    firstName: {
      type: "string",
      title: "firstName",
    },
    lastName: {
      type: "string",
      title: "lastName",
    },
    favoriteNumber: {
      type: "number",
      title: "favoriteNumber",
    },
  },
});

/**
 * 1) Company wants data
 * 2) Company specifies in JSON schema what data they want
 * 3) Company pays us to collect that data from people
 * 4) We automatically build a really nice looking form to collect that data from people (JSON Form, but a lot nicer, something like TypeForm)
 * 5) We pay people to fill out the form, and they never ever have to fill out forms again.
 */

// Create the definition using the created schema ID
await manager.createDefinition("ProfileDefinition", {
  name: "ProfileDefinition",
  description: "A simple human profile",
  schema: manager.getSchemaURL(profileSchemaID),
});

// Create a tile using the created schema ID
await manager.createTile(
  "exampleProfile",
  { firstName: "Nate", lastName: "Sesti", favoriteNumber: 3 },
  { schema: manager.getSchemaURL(profileSchemaID) }
);

// Publish model to Ceramic node
const model = await manager.toPublished();

// Write published model to JSON file
writeFile("./model.json", JSON.stringify(model), () => {});
