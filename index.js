//purpose: to minimize the following:
/*
	let Z be a matrix with dimensions LxM
	Z = [[z11,...,zm1], 
	     .
		 .
		 .
		 [zl1,...,zml]]

	d = [d1...dm]
	x = [x1,...,xl]

	so then 
	||x - Zd|| => ||[x1 - (z11*d1 +...+ zm1*dm),..., xl - (z1l*d1 +...+ zml*dm)]|| 
			   => sqrt((x1 - z11*d1 -...- zm1*dm)^2 +...+(xl - z1l*d1 -...- zml*dm)^2)

	||x - Zd||^2 =>  (x1 - z11*d1 -...- zm1*dm)^2 +...+(xl - z1l*d1 -...- zml*dm)^2

	the purpose of NNLS is to minimize ||x - Zd||^2
	subject to the constraint that 0 <= di for all  0 <= i <= M 

*/

var math = require('mathjs');

var arrayMath = math.create({
	matrix: 'array'
});

var EPSILON = Math.pow(2, -52);


//basic NNLS algorithm

function NNLS(independentMatrix, dependentVector, tolerance) {
	if(tolerance === undefined) {
		tolerance = math.max(math.size(independentMatrix)) * math.norm(independentMatrix, 1) * EPSILON;
	}
	if(typeof tolerance !== 'number') throw new Error('tolerance level needs to be a number but instead got ' + typeof tolerance);
	if(tolerance < 0) throw new Error('tolerance level needs to be greater than 0');
	if(independentMatrix.length !== dependentVector.length){
		throw new Error('independent matrix and dependent vector do not have same number of rows');	
	}
	var coefficients = math.matrix(independentMatrix);
	var regressors = math.zeros(coefficients.size()[1]);
	var passiveSet = [];
	var activeSet = arrayMath.range(0, regressors.size()[0]);
	var multipliers = math.multiply(math.transpose(coefficients), math.subtract(dependentVector, math.multiply(coefficients, regressors)));
	var activeMultipliers = math.subset(multipliers, math.index(activeSet));
	var maxActiveMultiplier = math.max(activeMultipliers);
	var indexOfMax = activeMultipliers.valueOf().indexOf(maxActiveMultiplier);
	while(activeSet.length && maxActiveMultiplier > tolerance) {
		passiveSet.concat(activeSet.splice(indexOfMax,1));
		var preRegressionSet = coefficients.subset(math.index(arrayMath.range(0, coefficients.size()[0]), indexOfMax));
	}
}

NNLS([[1,2,5], [3,6,9]], [1,4], 0.05);

//FNNLS algorithm
function FNNLS(coefficientMatrix, dependentVector) {

}
