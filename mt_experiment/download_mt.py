import requests
import xml.etree.ElementTree as ET
import os

def download_and_parse_mt():
    print("Simulating download from EarthScope SPUD EMTF...")
    
    # In a real scenario, you get this XML directly from the EarthScope portal for your station
    mock_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <EM_TF>
      <Data>
        <Period value="10.0">
          <Z size="[2 2]" type="complex">
            <value name="Zxx" output="Ex" input="Hx">1.23e-4 4.56e-4</value>
            <value name="Zxy" output="Ex" input="Hy">9.87e-3 -1.23e-3</value>
            <value name="Zyx" output="Ey" input="Hx">-8.76e-3 2.34e-3</value>
            <value name="Zyy" output="Ey" input="Hy">3.45e-4 -5.67e-4</value>
          </Z>
        </Period>
        <Period value="100.0">
          <Z size="[2 2]" type="complex">
            <value name="Zxx" output="Ex" input="Hx">2.23e-4 5.56e-4</value>
            <value name="Zxy" output="Ex" input="Hy">7.87e-3 -2.23e-3</value>
            <value name="Zyx" output="Ey" input="Hx">-6.76e-3 1.34e-3</value>
            <value name="Zyy" output="Ey" input="Hy">1.45e-4 -2.67e-4</value>
          </Z>
        </Period>
      </Data>
    </EM_TF>
    """
    
    xml_path = "mt_data.xml"
    with open(xml_path, "w") as f:
        f.write(mock_xml)
    print(f"Saved XML to {xml_path}")
    
    print("Parsing XML for Impedance Tensor (Z)...")
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # XML namespace handling can be tricky, so we'll do a simple search
    # Find all 'Z' elements (Impedance tensor)
    # The structure usually contains <Data> -> <Period> -> <Z> -> <value>
    
    for period_elem in root.iter('Period'):
        period_val = period_elem.attrib.get('value')
        
        # Find the Z components under this Period
        z_elem = period_elem.find('Z')
        if z_elem is not None:
            print(f"\n--- Found Impedance for Period: {period_val} seconds ---")
            for val in z_elem.findall('value'):
                comp_name = val.attrib.get('name')
                complex_val = val.text.strip().split()
                real_part = float(complex_val[0])
                imag_part = float(complex_val[1])
                print(f"  {comp_name}: Real = {real_part:.6f}, Imag = {imag_part:.6f}")
                
    print("\nExtraction complete! These Z-tensor values define local ground conductivity and should be used as your station metadata.")

if __name__ == "__main__":
    download_and_parse_mt()
