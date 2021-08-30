pragma solidity >=0.8.0;

contract FirstFiveFactors {
  uint num;
  uint[5] factors;
  uint i;

  constructor() payable {
    num = 0;
  }

  function factorize(uint nums) public payable {
    factors[0] = 0;
    factors[1] = 0;
    factors[2] = 0;
    factors[3] = 0;
    factors[4] = 0;
    num = nums;
    uint index = 0;

    for(i = 1; i <= num; ++i){
      if(num % i == 0) {
        factors[index] = i;
        index++;
      }
      
      if(index > 4){
          break;
      }
    }
    
  }

  function firstFactor() public view returns (uint) {
    return factors[0];
  }
  
  function secondFactor() public view returns (uint) {
    return factors[1];
  }
  
  function thirdFactor() public view returns (uint) {
    return factors[2];
  }
  
  function fourthFactor() public view returns (uint) {
    return factors[3];
  }
  
  function fifthFactor() public view returns (uint) {
    return factors[4];
  }
}