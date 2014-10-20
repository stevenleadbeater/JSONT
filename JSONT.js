/**
 * @constructor
 * @property {object} [sourceObject] The JSON object from which values are to be read for transformation.
 */
var JSONT = function(sourceObject)
{
	//The object from which namespaces and property values are taken
	this.sourceObject = sourceObject;
	
	/**
	 * Sets a property value in the output object to the value passed as an argument
	 * found in the sourceObject
	 * @param {string} [targetProperty] The target property (including namespaces) to create and populate in the output object.
	 * @param {string} [value] The value to set on the target property
	 */
	this.setPropertyValue = function(targetProperty, value){
		
		//Build an object from the target namespace string
		var obj = this._buildTargetObject(targetProperty, value);
		
		//Deep copy the newly namespaced property to the instance of JSONT that is being used to 
		//transform the data. This allows us to stringify our own instance later
		this._mergeRecursive(this, obj);
		
	};
	
	/**
	 * Sets a property value in the output object to the value of the target property
	 * found in the sourceObject
	 * @param {string} [sourceProperty] The property in the sourceObject from which the value is taken.
	 * @param {string} [targetProperty] The target property (including namespaces) to create and populate in the output object.
	 */
	this.setPropertyValueFromSource = function(sourceProperty, targetProperty){
		
		//Get the value of the sourceProperty from the sourceObject
		var sourceValue = this._getSourceValue(sourceProperty);
		
		//Build an object from the target namespace string
		var obj = this._buildTargetObject(targetProperty, sourceValue);
		
		//Deep copy the newly namespaced property to the instance of JSONT that is being used to 
		//transform the data. This allows us to stringify our own instance later
		this._mergeRecursive(this, obj);
		
	};
	
	/**
	 * Sets a property value in the output object to the result of passing it's value found in the 
	 * sourceObject to the expression argument (which is a function)
	 * @param {string} [sourceProperty] The property in the sourceObject from which the value is taken.
	 * @param {string} [targetProperty] The target property (including namespaces) to create and populate in the output object.
	 * @param {function} [expression] This function must take the value found in the sourceProperty
	 * as a parameter and must return the value that is to be used in it's place.
	 */
	this.setPropertyValueFromExpression = function(sourceProperty, targetProperty, expression){
		
		//Get the value of the sourceProperty from the sourceObject
		var sourceValue = this._getSourceValue(sourceProperty);
		
		//Call the expression function passed passing the property value we have found
		//this will now be the property we set on the target JSON object
		sourceValue = expression.call(this, sourceValue);
		
		//Build an object from the target namespace string
		var obj = this._buildTargetObject(targetProperty, sourceValue);
		
		//Deep copy the newly namespaced property to the instance of JSONT that is being used to 
		//transform the data. This allows us to stringify our own instance later
		this._mergeRecursive(this, obj);
		
	};

	/**
	 * Gets a property value in the source object
	 * @param {string} [sourceProperty] The property in the sourceObject from which the value is taken.
	 */
	this.getPropertyValue = function(sourceProperty){
		
		//Get the value of the sourceProperty from the sourceObject
		return this._getSourceValue(sourceProperty);
	};

	/**
	 * Gets a property value in the source object from the result of passing it's value found in the 
	 * sourceObject to the expression argument (which is a function)
	 * @param {string} [sourceProperty] The property in the sourceObject from which the value is taken.
	 * @param {function} [expression] This function must take the value found in the sourceProperty
	 * as a parameter and must return the value that is to be used in it's place.
	 */
	this.getPropertyValueFromExpression = function(sourceProperty, expression){
		
		//Get the value of the sourceProperty from the sourceObject
		var sourceValue = this._getSourceValue(sourceProperty);
		
		//Call the expression function passed passing the property value we have found
		return expression.call(this, sourceValue);
	};
	
	/**
	 * Get the JSON string of the properties which have been transformed
	 * @returns {string} The JSON representation of the formatting done by this instance 
	 */
	this.getJSON = function(){
		
		//We don't want to include the source object used to read the properties in the returned
		//JSON string so we need to save a reference to it, then remove it.
		var temp = this.sourceObject;
		delete this.sourceObject;
		//Get the JSON data from all the formatting operations (we saved it as properties in the
		//instance of this class that was used to do the formatting so we stringify ourselves later)
		var jsonData = JSON.stringify(this);
		//re-create the sourceObject from our temporary reference
		this.sourceObject = temp;
		//return the JSON string of the properties we are interested in
		return jsonData;
	};
	
	/**
	 * @private gets the value of the namespaced property from the sourceObject
	 * @param {string} [sourceProperty] The property in the sourceObject from which the value is taken.
	 * @returns {string} The value of the property in the sourceObject
	 */
	this._getSourceValue = function(sourceProperty) {
		//Step through sub properties until the value is found and hold it in a variable
		var nsArraySource = sourceProperty.split('.');
		var nsArraySourceLen = nsArraySource.length
		var sourceValue = this.sourceObject;
		
		for(var sourceIndex = 0; sourceIndex < nsArraySourceLen; sourceIndex++){
			//The value is the deepest property value, take them all and overwrite
			//every time a deeper sub property is found
            //try {
			sourceValue = sourceValue[nsArraySource[sourceIndex]];
            //} catch (exception){
            //    console.log(exception.message);
            //    console.log(exception.stack);
            //}
		}
		
		return sourceValue;
	};
	
	/**
	 * @private creates a new JSON object with all namespaces in the targetProperty parameter
	 * and sets the value to the targetValue argument passed
	 * @param {string} [targetProperty] The target property (including namespaces) to create and populate in the output object.
	 * @param {string} [targetValue] The value to set on the target property
	 * @returns {object} The fully namespace property value in an object
	 */
	this._buildTargetObject = function (targetProperty, targetValue) {
		/*Build an object from the target namespace string, obj will represent the members
		* of the current namespace. As obj1 references the instance of obj as it is when it is 
		* created this will hold the fully namespaced property when the source value is set
		*/
		var nsArrayTarget = targetProperty.split('.');
		//The lowest index will hold the value so we want less than the length minus 1
		//this is also helpful below when we want to set the source value as the length is now 
		// one less than the number of objects in the array which is zero based
		var nsArrayTargetLen = nsArrayTarget.length - 1;
		var obj = {};
		var obj1 = obj

		for(var targetIndex = 0; targetIndex < nsArrayTargetLen ; targetIndex++){
			
			//set the current namespace to be a new object then hold the new object in the obj
			//variable
			obj[nsArrayTarget[targetIndex]] = {};
			obj = obj[nsArrayTarget[targetIndex]];
		}
		
		//Set the source value
		obj[nsArrayTarget[nsArrayTargetLen]] = targetValue;
		
		//This is the fully namespaced property value
		return obj1;
	};
	
	/**
	 * @private Adds all the properties from the obj2 parameter to the obj1 parameter and returns obj1
	 * @param {string} [obj1] passed by reference, the object which will be populated with the new properties
	 * @param {string} [targetValue] The object which holds all the properties which are to be merged
	 */
	this._mergeRecursive = function(obj1, obj2) {

		  //iterate over all the properties in the object which is being consumed
		  for (var p in obj2) {
		      // Property in destination object set; update its value.
		      if ( obj2.hasOwnProperty(p) && typeof obj1[p] !== "undefined" ) {
		        this._mergeRecursive(obj1[p], obj2[p]);

		      } else {
		    	//We don't have that level in the heirarchy so add it
		        obj1[p] = obj2[p];

		      }
		 }
	}
}