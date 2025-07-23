import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from './App';

test('renders Weather App title', () => {
  render(<App />);
  const titleElement = screen.getByText(/weather app/i);
  expect(titleElement).toBeInTheDocument();
});



test("renders input and search button", () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/enter city/i);
  const buttonElement = screen.getByRole("button", { name: /search/i });
  expect(inputElement).toBeInTheDocument();
  expect(buttonElement).toBeInTheDocument();
});



test("fetches and displays weather data for a valid city", async () => {
  const mockWeatherData = {
    name: "Jeddah",
    weather: [{ description: "clear sky", icon: "01d" }],
    main: { temp: 33, humidity: 55 },
    wind: { speed: 4 },
  };

  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => mockWeatherData,
  });

  render(<App />);

  const input = screen.getByPlaceholderText(/enter city/i);
  const button = screen.getByRole("button", { name: /search/i });

  fireEvent.change(input, { target: { value: "Jeddah" } });
  fireEvent.click(button);

  const cityName = await screen.findByText(/jeddah/i);
  expect(cityName).toBeInTheDocument();
  expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
  expect(screen.getByText(/33 °C/)).toBeInTheDocument();
  expect(screen.getByText(/55%/)).toBeInTheDocument();
  expect(screen.getByText(/4 m\/s/)).toBeInTheDocument();

  global.fetch.mockRestore();
});



test("shows error message on invalid city", async () => {
  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: false,
    status: 404,
  });
  render(<App />);
  const input = screen.getByPlaceholderText(/enter city/i);
  const button = screen.getByRole("button", { name: /search/i });

  fireEvent.change(input, { target: { value: "InvalidCity" } });
  fireEvent.click(button);

  const errorMessage = await screen.findByText(/city not found/i);
  expect(errorMessage).toBeInTheDocument();

  global.fetch.mockRestore();
});