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
	var coefficients = math.matrix(independentMatrix),
	regressors = math.zeros(coefficients.size()[1]).valueOf(),
	passiveSet = [],
	activeSet = arrayMath.range(0, regressors.length),
	multipliers = math.multiply(math.transpose(coefficients), math.subtract(dependentVector, math.multiply(coefficients, regressors))),
	activeMultipliers = math.subset(multipliers, math.index(activeSet)),
	maxActiveMultiplier = math.max(activeMultipliers),
	indexOfMax = multipliers.valueOf().indexOf(maxActiveMultiplier),
	startingPassiveMatrix = math.matrix(math.zeros(coefficients.size())),
	rowRange = arrayMath.range(0, coefficients.size()[0]);
	while(activeSet.length && maxActiveMultiplier > tolerance) {
		passiveSet.push(activeSet.splice(activeSet.indexOf(indexOfMax),1)[0]);
		var columnIndex = passiveSet.length === 1 ? passiveSet[0] : passiveSet;
		var coefficientsP = startingPassiveMatrix.subset(math.index(rowRange, columnIndex),coefficients.subset(math.index(rowRange, columnIndex)));
		var pseudoInv = pInv(coefficientsP.valueOf());
		var sP = numeric.dot(pseudoInv, dependentVector);
		while(math.min(sP.filter(function(element, index) {
			return passiveSet.indexOf(index) !== -1;
		})) <= 0) {
			console.log('in the inner loop');
			var alpha = - math.min(passiveSet.map(function(element) {
				return regressors.valueOf()[element] / (regressors.valueOf()[element] - sP[element]);
			}));
			regressors = numeric.dot(alpha, numeric.sub(sP, regressors));
			for(var i = 0; i < regressors.length; i++) {
				var indexInPassive = passiveSet.indexOf(i);
				if(regressors[i] === 0 && indexInPassive !== -1) {
					activeSet.push(passiveSet.splice(indexInPassive)[0]);
				}
			}
			columnIndex = passiveSet.length === 1 ? passiveSet[0] : passiveSet;
			coefficientsP = startingPassiveMatrix.subset(math.index(rowRange, columnIndex));
			pseudoInv = pInv(coefficientsP.valueOf());
			var sP = numeric.dot(pseudoInv, dependentVector);
		}
		regressors = sP;
		multipliers = math.multiply(math.transpose(coefficients), math.subtract(dependentVector, math.multiply(coefficients, regressors)));
		if(activeSet.length) {
			activeMultipliers = math.subset(multipliers, math.index(activeSet));
			maxActiveMultiplier = math.max(activeMultipliers);
			indexOfMax = multipliers.valueOf().indexOf(maxActiveMultiplier);
		}
	}
	return regressors;
}

function pInv(matrix) {
	var m = matrix.length;
	var n = matrix[0].length;
	var invertedArr, decomp, U, V, S;
	if(n <= m) decomp = numeric.svd(matrix);
	else decomp = numeric.svd(numeric.transpose(matrix));
	U = decomp.U, V = decomp.V, S = decomp.S;
	var tol = Math.max(m, n)*numeric.epsilon*S[0];
	var sizeOfS = S.length;
	var sInv = new Array(sizeOfS);
	for(var i = 0; i < sizeOfS; i++) {
		if(S[i] > tol) sInv[i] = 1/S[i];
		else sInv[i] = 0;
	}
	if(n <= m) return numeric.dot(numeric.dot(V, numeric.diag(sInv)), numeric.transpose(U));
	else return numeric.dot(numeric.dot(U, numeric.diag(sInv)), numeric.transpose(V));
	// A = USVT => A+ = VS+UT
}

// console.log(NNLS([[1,5,2,9,6], [6,1,8,2,6], [2,4,2,5,7], [2,12,6,4,3], [12,19,3,5,10]], [1,11,20,12,34]));
// console.log(NNLS([[2,-1], [-1,2], [-1,-1]], [-4,-9,-16]));
//FNNLS algorithm
function FNNLS(coefficientMatrix, dependentVector) {

}
