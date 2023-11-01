class VelocityComponent {
    addTo(entity, dx = 0, dy = 0) {
        entity.dx = dx;
        entity.dy = dy;
        return entity;
    }
    removeFrom(entity) {
        delete entity.dx;
        delete entity.dy;
    }
    isOn(entity) {
        return "dx" in entity;
    }
}
/** Allows movement of this entity */
export const velocityComponent = new VelocityComponent();
//# sourceMappingURL=VelocityComponent.js.map