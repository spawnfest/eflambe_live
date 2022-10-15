defmodule EflambeLive.MixProject do
  use Mix.Project

  @version "0.1.0"
  @description "eFlambè integration with Livebook"

  def project do
    [
      app: :eflambe_live,
      version: @version,
      description: @description,
      elixir: "~> 1.13",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      docs: docs(),
      package: package()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      # TODO: Change this once eflambe changes are finalized
      {:eflambe, github: "Stratus3D/eflambe"},
      {:kino, "~> 0.7.0"},

      # Dev dependencies
      {:credo, "~> 1.6.7", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.0", only: [:dev], runtime: false}
    ]
  end

  defp docs do
    # TODO
    []
  end

  defp package do
    [
      licenses: ["Apache-2.0"],
      links: %{}
    ]
  end
end
