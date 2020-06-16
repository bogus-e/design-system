import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@cmsgov/design-system';
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
    return [
      <Table key="propDocsTable" stackBreakpoint="sm" scrollable>
        <TableCaption className="ds-u-padding-y--2 ds-u-font-size--h3">Props</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell id="columnname" scope="col">
              Name
            </TableHeaderCell>
            <TableHeaderCell id="columntype" scope="col">
              Type
            </TableHeaderCell>
            <TableHeaderCell id="columndefault" scope="col">
              Default
            </TableHeaderCell>
            <TableHeaderCell id="columndescription" scope="col">
              Description
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>{this.rows()}</TableBody>
      </Table>,
    ];
  }
}

ReactPropDocs.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  propDocs: PropTypes.object,
};

export default ReactPropDocs;
