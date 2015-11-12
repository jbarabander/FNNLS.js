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
var numeric = require('numeric');

var arrayMath = math.create({
	matrix: 'array'
});



//basic NNLS algorithm
function NNLS(independentMatrix, dependentVector, tolerance) {
	if(tolerance === undefined) {
		tolerance = math.max(math.size(independentMatrix)) * math.norm(independentMatrix, 1) * numeric.epsilon;
	}
	if(typeof tolerance !== 'number') throw new Error('tolerance level needs to be a number but instead got: ' + typeof tolerance);
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
	var coefficientsP = math.matrix(math.zeros(coefficients.size()));
	var columnRange = arrayMath.range(0, coefficients.size()[0]);

	while(activeSet.length && maxActiveMultiplier > tolerance) {
		console.log(multipliers);
		passiveSet = passiveSet.concat(activeSet.splice(indexOfMax,1));
		coefficientsP = coefficientsP.subset(math.index(columnRange, indexOfMax),coefficients.subset(math.index(columnRange, indexOfMax)));
		var tCoefficientsP = math.transpose(coefficientsP),
		//FIXME: need to fix this later to make sure that if we already have more rows than columns we use the original and not the transpose
		 z = numeric.svd(tCoefficientsP.valueOf()), U = z.U, S = z.S, V = z.V, sInv = [];
		var sInv = new Array(S.length);
		for(var i = 0; i < S.length; i++) {
			if(S[i] > tolerance) sInv[i] = 1 / S[i];
			else sInv[i] = 0;
		}
		var pInv = numeric.dot(numeric.transpose(U), numeric.dot(numeric.diag(sInv), numeric.transpose(V)));
		var sP = numeric.dot(numeric.dot(pInv, tCoefficientsP.valueOf()), dependentVector);
		// while(math.min(sP) < 0) {
		while(math.min(sP.filter(function(element, index) {
			return passiveSet.indexOf(index) !== -1;
		})) <= 0) {
			// var sigma = - math.min(passiveSet.map(function(element) {
			// 	return regressors.valueOf()[element] / (regressors.valueOf()[element] - sP[element]);
			// }));
			// regressors = numeric.dot(sigma, numeric.sub(sP, regressors.valueOf()));
			console.log('in inner loop');
			break;
		}
		regressors = sP;
		multipliers = math.multiply(math.transpose(coefficients), math.subtract(dependentVector, math.multiply(coefficients, regressors)));
		activeMultipliers = math.subset(multipliers, math.index(activeSet));
		maxActiveMultiplier = math.max(activeMultipliers);
		indexOfMax = activeMultipliers.valueOf().indexOf(maxActiveMultiplier);
		console.log(multipliers);
	}
}

// function pinv(A) {
//   var z = numeric.svd(A), foo = z.S[0];
//   var U = z.U, S = z.S, V = z.V;
//   var m = A.length, n = A[0].length, tol = Math.max(m,n)*numeric.epsilon*foo,M = S.length;
//   var i,Sinv = new Array(M);
//   for(i=M-1;i!==-1;i--) { if(S[i]>tol) Sinv[i] = 1/S[i]; else Sinv[i] = 0; }
//   return numeric.dot(numeric.dot(V,numeric.diag(Sinv)),numeric.transpose(U))
// }

NNLS([[1,2,5], [3,6,9], [4,9,12]], [1,4, 7], 0.05);

//FNNLS algorithm
function FNNLS(coefficientMatrix, dependentVector) {

}
