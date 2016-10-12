var elementUtilities = function () {
  return {
    //this method returns the nodes non of whose ancestors is not in given nodes
    getTopMostNodes: function (nodes) {
      var nodesMap = {};
      for (var i = 0; i < nodes.length; i++) {
        nodesMap[nodes[i].id()] = true;
      }
      var roots = nodes.filter(function (i, ele) {
        var parent = ele.parent()[0];
        while (parent != null) {
          if (nodesMap[parent.id()]) {
            return false;
          }
          parent = parent.parent()[0];
        }
        return true;
      });

      return roots;
    },
    // Get the corner positions of the node
    getCornerPositions: function(node) {
      var posX = node.position('x');
      var posY = node.position('y');
      var halfWidth = node.width() / 2;
      var halfHeight = node.height() / 2;
      
      return {
        'topLeft': {
          x: posX - halfWidth,
          y: posY - halfHeight
        },
        'topRight': {
          x: posX + halfWidth,
          y: posY - halfHeight
        },
        'bottomLeft': {
          x: posX - halfWidth,
          y: posY + halfHeight
        },
        'bottomRight': {
          x: posX + halfWidth,
          y: posY + halfHeight
        }
      };
    }
  };
};

module.exports = elementUtilities;