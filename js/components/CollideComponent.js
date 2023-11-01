class CollideComponent {
    addTo(entity, bounceFactor = -1) {
        entity.bounceFactor = bounceFactor;
        entity.collidesWith = "";
        return entity;
    }
    removeFrom(entity) {
        delete entity.bounceFactor;
        delete entity.collidesWith;
    }
    isOn(entity) {
        return "bounceFactor" in entity;
    }
}
/** This entity will bounce to other CollideComponents */
export const collideComponent = new CollideComponent();
//# sourceMappingURL=CollideComponent.js.map