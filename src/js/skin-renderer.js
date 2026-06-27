// Safe and robust material customization using official model-viewer API
function initSkinRenderer() {
  var wrappers = document.querySelectorAll('.concept-viewer-wrapper');
  wrappers.forEach(function (wrapper) {
    var prompt = wrapper.querySelector('.interaction-prompt');
    var modelViewer = wrapper.querySelector('model-viewer');
    
    if (modelViewer) {
      var hasApplied = false;
      
      var applySkinSettings = function () {
        if (hasApplied || !modelViewer.model) return;
        
        var materials = modelViewer.model.materials;
        if (!materials || materials.length === 0) return;
        hasApplied = true;

        // Apply realistic skin properties safely via the official Model Viewer material API
        materials.forEach(function (material) {
          if (material.pbrMetallicRoughness) {
            material.pbrMetallicRoughness.setMetallicFactor(0.0);
            material.pbrMetallicRoughness.setRoughnessFactor(0.8);
            // Apply a warm skin color tint (complements the black and grey tattoo artwork)
            material.pbrMetallicRoughness.setBaseColorFactor([0.94, 0.81, 0.73, 1.0]);
          }
        });
      };

      modelViewer.addEventListener('load', applySkinSettings);
      
      // If already loaded/ready from cache, apply immediately
      if (modelViewer.model && modelViewer.model.materials && modelViewer.model.materials.length > 0) {
        applySkinSettings();
      }
    }

    if (prompt) {
      var hasInteracted = false;
      var hidePrompt = function () {
        if (hasInteracted) return;
        hasInteracted = true;
        prompt.classList.add('fade-out');
        
        wrapper.removeEventListener('pointerdown', hidePrompt);
        wrapper.removeEventListener('touchstart', hidePrompt);
        if (modelViewer) {
          modelViewer.removeEventListener('user-interaction', hidePrompt);
        }
      };

      wrapper.addEventListener('pointerdown', hidePrompt, { passive: true });
      wrapper.addEventListener('touchstart', hidePrompt, { passive: true });
      
      if (modelViewer) {
        modelViewer.addEventListener('user-interaction', hidePrompt, { passive: true });
      }
    }
  });
}

// Run immediately and attach event listener
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkinRenderer);
} else {
  initSkinRenderer();
}
