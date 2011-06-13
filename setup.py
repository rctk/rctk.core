from setuptools import setup, find_packages
import os

version = '1.0'

setup(name='rctk.core',
      version=version,
      description="RCTK Core",
      long_description=open("README.txt").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
      classifiers=[
        "Programming Language :: Python",
        ],
      keywords='',
      author='Ivo van der Wijk',
      author_email='ivo@rctk.org',
      url='http://rctk.org/',
      license='BSD',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['rctk'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'rctk',
      ],
      entry_points="""
      # -*- Entry points: -*-
      """,
      )
