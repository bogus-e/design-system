import PropTypes from 'prop-types';
import React from 'react';
import ReactPropDoc from './ReactPropDoc';

/**
 * Render a table with property documentation (generated by react-docgen)
 */
class ReactPropDocs extends React.PureComponent {
  rows() {
    const props = Object.getOwnPropertyNames(this.props.propDocs);

    return props.map((prop) => {
      // Hides docs for react props with `@hide-prop` tag in the description
      const description = this.props.propDocs[prop].description;
      if (!description.match(/@hide-prop/i)) {
        return <ReactPropDoc key={prop} name={prop} {...this.props.propDocs[prop]} />;
      }
    });
  }

  render() {
    // Specify ARIA roles attribute for table to ensure responsive HTML table is accessible to screen readers
    return [
      <h3 key="propDocsHeader">Props</h3>,
      <div key="propDocsTable" className="docs_table--container">
        <table className="ds-c-table ds-c-table--borderless docs_table" role="table">
          <caption>
            <span className="ds-u-padding--1 ds-u-visibility--screen-reader">
              React Properties Documentation
            </span>
          </caption>
          <thead>
            <tr role="row">
              <th id="columnname" role="columnheader" scope="col">
                Name
              </th>
              <th id="columntype" role="columnheader" scope="col">
                Type
              </th>
              <th id="columndefault" role="columnheader" scope="col">
                Default
              </th>
              <th id="columndescription" role="columnheader" scope="col">
                Description
              </th>
            </tr>
          </thead>
          <tbody>{this.rows()}</tbody>
        </table>
      </div>,
    ];
  }
}

ReactPropDocs.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  propDocs: PropTypes.object,
};

export default ReactPropDocs;
