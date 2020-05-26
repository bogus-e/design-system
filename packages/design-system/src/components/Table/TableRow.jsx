import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

export const TableRow = ({ children, className, ...attributeOptions }) => {
  const classes = classNames('ds-c-table__row', className);

  return (
    <tr className={classes} role="row" {...attributeOptions}>
      {children}
    </tr>
  );
};

TableRow.defaultProps = {
  className: '',
};

TableRow.propTypes = {
  /**
   * The table row content.
   */
  children: PropTypes.node.isRequired,
  /**
   * Additional classes to be added to the table row element.
   */
  className: PropTypes.string,
};

export default TableRow;
