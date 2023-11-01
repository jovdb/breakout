class GravityComponent {
    addTo(entity) {
        entity.gravityY = 0.05;
        return entity;
    }
    removeFrom(entity) {
        delete entity.gravityY;
    }
    isOn(entity) {
        return "gravityY" in entity;
    }
}
/** Adds gravity to the entity: it will fall down */
export const gravityComponent = new GravityComponent();
//# sourceMappingURL=GravityComponent.js.map