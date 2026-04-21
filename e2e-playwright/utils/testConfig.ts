// Configuration for data-driven testing strategies
export const TestDataConfig = {
  // Run tests for all products
  ALL_PRODUCTS: {
    strategy: 'all',
    description: 'Run tests for all products in the dataset'
  },
  
  // Run tests for a subset of products
  SUBSET: {
    strategy: 'subset',
    startIndex: 0,
    count: 3,
    description: 'Run tests for first 3 products'
  },
  
  // Run tests for specific product types
  CORRUGATED_BOX: {
    strategy: 'filter',
    filterType: 'ProductType',
    filterValue: 'Corrugated Box',
    description: 'Run tests only for Corrugated Box products'
  },
  
  // Run tests for specific category
  PACKAGING: {
    strategy: 'filter',
    filterType: 'ProductCategory', 
    filterValue: 'Packaging',
    description: 'Run tests only for Packaging category products'
  },
  
  // Run tests for random products
  RANDOM: {
    strategy: 'random',
    count: 2,
    description: 'Run tests for 2 random products'
  }
};

export const ExecutionConfig = {
  // Sequential execution (one after another)
  SEQUENTIAL: {
    parallel: false,
    description: 'Run tests one after another'
  },
  
  // Parallel execution (run simultaneously)
  PARALLEL: {
    parallel: true,
    workers: 3,
    description: 'Run tests in parallel with 3 workers'
  }
};
