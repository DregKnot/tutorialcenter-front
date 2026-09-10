/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateOfBirthPicker from './DateOfBirthPicker';

describe('DateOfBirthPicker', () => {
  test('renders with manual mode active by default taking majority space', () => {
    render(<DateOfBirthPicker value="" onChange={jest.fn()} />);
    
    // The manual input is present
    const input = screen.getByPlaceholderText('DD / MM / YYYY');
    expect(input).toBeInTheDocument();
    
    // Check parent containers for dynamic flex allocation
    const manualSection = input.closest('.flex-\\[68\\]');
    expect(manualSection).not.toBeNull();
    
    // Calendar companion should be in compact flex-[32]
    const calButton = screen.getByText('Cal').closest('.flex-\\[32\\]');
    expect(calButton).not.toBeNull();
  });

  test('auto-formats numbers with slashes as user types', () => {
    const handleChange = jest.fn();
    render(<DateOfBirthPicker value="" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('DD / MM / YYYY');

    // Type '02' -> should auto append slash '02/'
    fireEvent.change(input, { target: { value: '02' } });
    expect(input.value).toBe('02/');

    // Type '0209' -> should auto append slash '02/09/'
    fireEvent.change(input, { target: { value: '0209' } });
    expect(input.value).toBe('02/09/');

    // Type '02092004' -> full date '02/09/2004'
    fireEvent.change(input, { target: { value: '02092004' } });
    expect(input.value).toBe('02/09/2004');

    // Should emit ISO format '2004-09-02' to parent
    expect(handleChange).toHaveBeenCalledWith({
      target: {
        name: 'date_of_birth',
        value: '2004-09-02',
      },
    });
  });

  test('handles backspace over automated slashes cleanly', () => {
    render(<DateOfBirthPicker value="" onChange={jest.fn()} />);
    const input = screen.getByPlaceholderText('DD / MM / YYYY');

    // Type '02' -> '02/'
    fireEvent.change(input, { target: { value: '02' } });
    expect(input.value).toBe('02/');

    // Simulate backspace when cursor is at index 3 ('02/|')
    input.setSelectionRange(3, 3);
    fireEvent.keyDown(input, { key: 'Backspace' });

    // Should remove both the slash and the preceding '2', leaving '0'
    expect(input.value).toBe('0');
  });

  test('switches to calendar mode expanding calendar and pushing manual to side', () => {
    render(<DateOfBirthPicker value="2004-09-02" onChange={jest.fn()} />);
    
    // Click calendar compact button
    const calCompact = screen.getByText('Cal');
    fireEvent.click(calCompact);

    // Now calendar should have flex-[68] and manual should have flex-[32]
    expect(screen.getByText('Pick')).toBeInTheDocument();
    const elements = screen.getAllByText('02/09/2004');
    expect(elements.length).toBe(2);
    // One in flex-[32] and one in flex-[68]
    expect(elements[0].closest('.flex-\\[32\\]')).not.toBeNull();
    expect(elements[1].closest('.flex-\\[68\\]')).not.toBeNull();
  });

  test('validates impossible date and displays error', () => {
    const handleChange = jest.fn();
    render(<DateOfBirthPicker value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('DD / MM / YYYY');

    // Enter invalid month '35'
    fireEvent.change(input, { target: { value: '15352004' } });
    expect(screen.getByText('Invalid month (01-12)')).toBeInTheDocument();
    
    // Should propagate empty string for invalid date
    expect(handleChange).toHaveBeenCalledWith({
      target: {
        name: 'date_of_birth',
        value: '',
      },
    });
  });

  test('validates future date and displays error', () => {
    const handleChange = jest.fn();
    render(<DateOfBirthPicker value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('DD / MM / YYYY');

    // Year in the future (e.g. 2099)
    fireEvent.change(input, { target: { value: '01012099' } });
    expect(screen.getByText('Date cannot be in the future')).toBeInTheDocument();
  });
});
