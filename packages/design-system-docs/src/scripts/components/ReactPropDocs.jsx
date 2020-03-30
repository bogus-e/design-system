import PropTypes from 'prop-types';
import React from 'react';
import ReactPropDoc from './ReactPropDoc';

/**
 * Render a table with property documentation (generated by react-docgen)
 */
class ReactPropDocs extends React.PureComponent {
  rows() {
    const props = Object.getOwnPropertyNames(this.props.propDocs);

    return props.map(prop => {
      // Hides docs for react props with `@hide-prop` tag in the description
      const description = this.props.propDocs[prop].description;
      if (!description.match(/@hide-prop/i)) {
        return <ReactPropDoc key={prop} name={prop} {...this.props.propDocs[prop]} />;
      }
    });
  }

  render() {
    return [
      <h3 key="propDocsHeader">Props</h3>,
      <table key="propDocsTable" className="ds-c-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>{this.rows()}</tbody>
      </table>
    ];
  }
}

ReactPropDocs.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  propDocs: PropTypes.object
};

export default ReactPropDocs;