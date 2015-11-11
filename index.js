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

var numeric = require('numeric');
var math = require('mathjs');


//basic NNLS algorithm

function NNLS(coefficientMatrix, dependentVector) {
	var coefficients = math.matrix(coefficientMatrix);
	console.dir(coefficients);
	if(coefficientMatrix.length !== dependentVector.length){
		throw new Error('Coefficient Matrix and depent vector do not have same number of rows');	
	}
	var regressors = math.zeros(coefficients.size()[1]);
}

NNLS([[1,2,5], [3,6,9]], [1,4]);
