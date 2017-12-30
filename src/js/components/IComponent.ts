interface IComponent<TComponentProps extends object = {}> {

	/** Add this component to an enitity */
	addTo<TEntity extends IMutableEntity>(entity: TEntity, ...args: any[]): TEntity & TComponentProps;

	/** Remove this component to an enitity */
	removeFrom(entity: IMutableEntity & TComponentProps): void;

	/** Does the entity contains this component */
	isOn<TEntity extends IEntity>(entity: TEntity): entity is TEntity & TComponentProps;
}
