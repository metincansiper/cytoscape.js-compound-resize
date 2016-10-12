var scratchUtilities = function() {
  return {
    getScratch: function(cyOrEle) {
      var scratch = cyOrEle.scratch('_compoundResize');
      return scratch ? scratch : {};
    }
  };
};

module.exports = scratchUtilities;