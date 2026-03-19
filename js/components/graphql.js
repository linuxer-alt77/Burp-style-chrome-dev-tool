/**
 * GraphQL Query Detection and Parsing
 * Detects GraphQL queries and provides enhanced UI for them
 */

class GraphQLDetector {
  /**
   * Check if a request is a GraphQL query
   */
  static isGraphQLRequest(request) {
    const contentType = request.headers?.['content-type'] || '';
    const url = request.url.toLowerCase();
    
    // Check if it's a GraphQL endpoint
    if (url.includes('graphql')) {
      return true;
    }
    
    // Check if POST request with JSON containing 'query' field
    if (request.method === 'POST' && contentType.includes('application/json')) {
      try {
        const body = JSON.parse(request.body || '{}');
        return !!(body.query || body.operationName);
      } catch {
        return false;
      }
    }
    
    return false;
  }

  /**
   * Parse GraphQL query
   */
  static parseQuery(queryString) {
    try {
      // Simple parser for GraphQL queries
      const query = {
        type: null,
        operationName: null,
        variables: {},
        fields: []
      };

      // Detect operation type (query, mutation, subscription)
      if (queryString.includes('mutation')) {
        query.type = 'mutation';
      } else if (queryString.includes('subscription')) {
        query.type = 'subscription';
      } else {
        query.type = 'query';
      }

      // Extract operation name
      const nameMatch = queryString.match(/(?:query|mutation|subscription)\s+(\w+)/);
      if (nameMatch) {
        query.operationName = nameMatch[1];
      }

      // Extract variables
      const varsMatch = queryString.match(/\$(\w+):\s*(\w+)/g);
      if (varsMatch) {
        varsMatch.forEach(v => {
          const [name, type] = v.split(':').map(s => s.trim().replace('$', ''));
          query.variables[name] = type;
        });
      }

      return query;
    } catch (error) {
      console.error('Error parsing GraphQL query:', error);
      return null;
    }
  }

  /**
   * Format GraphQL query for display
   */
  static formatQuery(queryString) {
    try {
      // Basic formatting
      return queryString
        .replace(/\s+/g, ' ')
        .replace(/\{/g, '{\n  ')
        .replace(/\}/g, '\n}')
        .replace(/,/g, ',\n  ')
        .trim();
    } catch {
      return queryString;
    }
  }

  /**
   * Extract variables from request body
   */
  static extractVariables(body) {
    try {
      const parsed = JSON.parse(body);
      return parsed.variables || {};
    } catch {
      return {};
    }
  }
}

export default GraphQLDetector;
