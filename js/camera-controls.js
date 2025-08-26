AFRAME.registerComponent('camera-zoom', {
  schema: {
    minFov: { type: 'number', default: 20 },
    maxFov: { type: 'number', default: 100 },
    zoomSpeed: { type: 'number', default: 0.1 },
    rotationSpeed: { type: 'number', default: 0.004 },
  },

  init: function () {
    this.camera = this.el;
    this.canvasEl = this.el.sceneEl.canvas;
    this.swipeGuide = document.getElementById('swipe-guide');
    
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.handleFirstInteraction = this.handleFirstInteraction.bind(this);

    this.canvasEl.addEventListener('wheel', this.onMouseWheel, { passive: false });
    this.canvasEl.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.canvasEl.addEventListener('contextmenu', this.onContextMenu);
    this.canvasEl.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvasEl.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvasEl.addEventListener('touchend', this.onTouchEnd);
    
    this.canvasEl.addEventListener('mousedown', this.handleFirstInteraction, { once: true });
    this.canvasEl.addEventListener('touchstart', this.handleFirstInteraction, { once: true });
    this.canvasEl.addEventListener('wheel', this.handleFirstInteraction, { once: true });

    this.isDragging = false;
    this.lastPosition = { x: 0, y: 0 };
    this.initialPinchDistance = 0;
  },

  handleFirstInteraction: function () {
    if (this.swipeGuide) {
      this.swipeGuide.style.opacity = '0';
      setTimeout(() => {
        if (this.swipeGuide && this.swipeGuide.parentNode) {
          this.swipeGuide.parentNode.removeChild(this.swipeGuide);
          this.swipeGuide = null;
        }
      }, 500);
    }
  },

  onContextMenu: function (event) { event.preventDefault(); },

  onMouseDown: function (event) {
    if (event.button === 0) {
      this.isDragging = true;
      this.lastPosition.x = event.clientX;
      this.lastPosition.y = event.clientY;
    }
  },

  onMouseUp: function (event) {
    this.isDragging = false;
  },

  onMouseMove: function (event) {
    if (!this.isDragging) return;
    const deltaX = event.clientX - this.lastPosition.x;
    const deltaY = event.clientY - this.lastPosition.y;
    this.updateRotation(deltaX, deltaY);
    this.lastPosition.x = event.clientX;
    this.lastPosition.y = event.clientY;
  },
  
  onMouseWheel: function (event) {
    if (event.ctrlKey) return;
    event.preventDefault();
    let fov = this.camera.getAttribute('camera').fov;
    fov += event.deltaY * this.data.zoomSpeed;
    this.updateFov(fov);
  },

  onTouchStart: function (event) {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.lastPosition.x = event.touches[0].pageX;
      this.lastPosition.y = event.touches[0].pageY;
    } else if (event.touches.length === 2) {
      this.isDragging = false;
      this.initialPinchDistance = this.getPinchDistance(event);
    }
  },

  onTouchMove: function (event) {
    if (this.isDragging && event.touches.length === 1) {
      const currentX = event.touches[0].pageX;
      const currentY = event.touches[0].pageY;
      const deltaX = currentX - this.lastPosition.x;
      const deltaY = currentY - this.lastPosition.y;
      this.updateRotation(deltaX, deltaY);
      this.lastPosition.x = currentX;
      this.lastPosition.y = currentY;
    } 
    else if (event.touches.length === 2) {
      const currentPinchDistance = this.getPinchDistance(event);
      const pinchDelta = currentPinchDistance - this.initialPinchDistance;
      let fov = this.camera.getAttribute('camera').fov;
      fov -= pinchDelta * this.data.zoomSpeed * 2;
      this.updateFov(fov);
      this.initialPinchDistance = currentPinchDistance;
    }
  },

  onTouchEnd: function (event) {
    this.initialPinchDistance = 0;
    if (event.touches.length < 1) {
      this.isDragging = false;
    }
  },

  updateRotation: function(deltaX, deltaY) {
    const rotation = this.camera.object3D.rotation;
    const PI_2 = Math.PI / 2;
    rotation.y += deltaX * this.data.rotationSpeed;
    rotation.x += deltaY * this.data.rotationSpeed;
    rotation.x = Math.max(-PI_2, Math.min(PI_2, rotation.x));
  },
  
  updateFov: function(fov) {
    const clampedFov = Math.max(this.data.minFov, Math.min(this.data.maxFov, fov));
    this.camera.setAttribute('camera', 'fov', clampedFov);
  },

  getPinchDistance: function (event) {
    const t1 = event.touches[0];
    const t2 = event.touches[1];
    return Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
  },
  
  remove: function () {
    this.canvasEl.removeEventListener('wheel', this.onMouseWheel);
    this.canvasEl.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvasEl.removeEventListener('contextmenu', this.onContextMenu);
    this.canvasEl.removeEventListener('touchstart', this.onTouchStart);
    this.canvasEl.removeEventListener('touchmove', this.onTouchMove);
    this.canvasEl.removeEventListener('touchend', this.onTouchEnd);
    this.canvasEl.removeEventListener('mousedown', this.handleFirstInteraction);
    this.canvasEl.removeEventListener('touchstart', this.handleFirstInteraction);
    this.canvasEl.removeEventListener('wheel', this.handleFirstInteraction);
  }
});