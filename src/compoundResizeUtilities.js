var compundResizeUtilities = function (cy) {
  var scratchUtilities = require("./scratchUtilities")();
  
  return {
    setPaddings: function (nodes, paddings) {
      cy.startBatch();

      nodes.each(function (i, ele) {
        var minPaddings = this.getMinPaddings(ele);
        var maxPaddings = this.getMaxPaddings(ele);

        if (paddings.left > minPaddings.left && paddings.left > maxPaddings.left) {
          ele.css('padding-left', paddings.left);
        }

        if (paddings.right > minPaddings.right && paddings.right > maxPaddings.right) {
          ele.css('padding-right', paddings.right);
        }

        if (paddings.top > minPaddings.top && paddings.top > maxPaddings.top) {
          ele.css('padding-top', paddings.top);
        }

        if (paddings.bottom > minPaddings.bottom && paddings.bottom > maxPaddings.bottom) {
          ele.css('padding-bottom', paddings.bottom);
        }
      });

      cy.endBatch();
    },
    setExtremePaddings: function (nodes, paddings, minOrMax) {
      cy.startBatch();

      nodes.each(function (i, ele) {
        var paddingLeft = ele.css('padding-left');
        var paddingRight = ele.css('padding-right');
        var paddingTop = ele.css('padding-top');
        var paddingBottom = ele.css('padding-bottom');

        // Get the minimum paddings to set them
        var extremePaddings = minOrMax === 'min' ? this.getMinimumPaddings(ele) : this.getMaximumPaddings(ele);
        
        var sign = minOrMax === 'min' ? 1 : -1;

        if (paddings.left) {
          if (paddingLeft * sign < paddings.left * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-left', paddings.left);
          }

          extremePaddings.left = paddings.left;
        }

        if (paddings.right) {
          if (paddingRight * sign < paddings.right * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-right', paddings.right);
          }

          extremePaddings.right = paddings.right;
        }

        if (paddings.top) {
          if (paddingTop * sign < paddings.top * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-top', paddings.top);
          }

          extremePaddings.top = paddings.top;
        }

        if (paddings.bottom) {
          if (paddingBottom * sign < paddings.bottom * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-bottom', paddings.bottom);
          }

          extremePaddings.bottom = paddings.bottom;
        }
      });

      cy.endBatch();
    },
    getMinimumPaddings: function (node) {
      var paddings = scratchUtilities.getScratch(node).minPaddings;
      return paddings ? paddings : {};
    },
    getMaximumPaddings: function (node) {
      var paddings = scratchUtilities.getScratch(node).maxPaddings;
      return paddings ? paddings : {};
    }
  };
};

module.exports = compundResizeUtilities;