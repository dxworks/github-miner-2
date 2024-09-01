import * as yaml from "yamljs";
import { Orchestrator } from "./Processors/Orchestrator";

const config = yaml.load("configs/config.yml");

const orchestrator = new Orchestrator(config);

orchestrator.processData();
