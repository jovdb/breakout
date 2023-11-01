class PositionComponent {
    addTo(entity, x = 0, y = 0) {
        entity.x = x;
        entity.y = y;
        return entity;
    }
    removeFrom(entity) {
        delete entity.x;
        delete entity.y;
    }
    isOn(entity) {
        return "x" in entity;
    }
}
/** Adds a position (x, y) to the entity */
export const positionComponent = new PositionComponent();
//# sourceMappingURL=PositionComponent.js.map