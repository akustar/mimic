'use strict';

var FORMAT_NAME = "ass";

//Compatible format
import ssa from './ssa.js'

export default {
  name: FORMAT_NAME,
  helper: ssa.helper,
  detect: ssa.detect,
  parse: ssa.parse,
  build: ssa.build
};