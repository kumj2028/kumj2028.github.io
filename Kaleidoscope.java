package project;

import javax.swing.*;

import java.awt.*;
import java.awt.event.*;
import java.util.*;

public class Kaleidoscope extends JFrame implements ActionListener {
	private JButton shakeButton = new JButton("Shake Kaleidoscope");// button for moving the objects in the kaleidoscope
	private JCheckBox gridBox = new JCheckBox("Show/Hide Grid", true);//  a checkbox to show or hide the white grid, default is off
	private JButton zoomInButton = new JButton ("Zoom In");//  a button to zoom in to the kaleidoscope
	private JButton zoomOutButton = new JButton ("Zoom Out");// a button to zoom out of the kaleidoscope
	private JButton newShapeButton = new JButton ("Add New Shape");// a button to add a new shape to the kaleidoscope
	private JFrame frame;
	private ImageIcon icon = createImage("images/middle.gif");
	private static Color grid= Color.WHITE;
	private static ArrayList<Color> c = new ArrayList<Color>();
	private static ArrayList<Integer> sides= new ArrayList<Integer>();
	private static boolean random=true;
	private static int shapeNumber;
	private static int[][] r1= new int[100][99];
	private static int[][] r2= new int[100][99];
	private static int zoom=200;
	private Graphics g;
	
    private void buildUI(Container container) {
        container.setLayout( new BoxLayout(container, BoxLayout.PAGE_AXIS) );
        CoordinateArea coordinateArea = new CoordinateArea(this);  // see below
        container.add(coordinateArea);
    }

    private ImageIcon createImage(String string) {
		// TODO Auto-generated method stub
		return null;
	}

	public Kaleidoscope() {
        shapeNumber=0;
    	setDefaultLookAndFeelDecorated(true);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        //frame.setLayout(new GridLayout(2,5));
        //Kaleidoscope controller = new Kaleidoscope();
        buildUI(getContentPane());
        add(shakeButton);
        add(gridBox);
        add(zoomInButton);
        add(zoomOutButton);
        add(newShapeButton);
        shakeButton.addActionListener(this);
        gridBox.addActionListener(this);
        zoomInButton.addActionListener(this);
        zoomOutButton.addActionListener(this);
        newShapeButton.addActionListener(this);
        pack();
        setVisible(true);
    }

    public static void main(String[] args) {
    	
        new Kaleidoscope();
    	/*SwingUtilities.invokeLater(new Runnable() {   
        	public void run() { createAndShowGUI(); }   
        	}
        );*/          // end of invokeLater
    }  // end of main

    @SuppressWarnings("serial")
    
	public static class CoordinateArea extends JComponent {
		//Point point = null;
        Kaleidoscope controller;
        Dimension preferredSize = new Dimension(800,800); // choose size!!
        Color gridColor;
    
        public CoordinateArea(Kaleidoscope controller) {
            this.controller = controller;
            
            //Add border of 10 pixels at L and bottom, and 4 pixels at the top and R.
            //setBorder(BorderFactory.createMatteBorder(24,10,70,4,"RED));
            
            setBackground(Color.BLACK);
            setOpaque(true);
        }  // end of constructor
    
        public Dimension getPreferredSize() {
            return preferredSize;
        }
        
        public int[][][] getReflections(int numOfSides){
        	shapeNumber++;
        	int[][][] coords= new int[2][199999][numOfSides];
        	for (int i=0; i<coords[0][0].length; i++){
        		//original 6 reflections
            	coords[0][0][i]=getWidth()/2 + r1[shapeNumber][i];
            	coords[1][0][i]=getHeight()/2 - r2[shapeNumber][i];
            	coords[0][1][i]=getWidth()/2 + r1[shapeNumber][i];
            	coords[1][1][i]=getHeight()/2 + r2[shapeNumber][i];
            	coords[0][2][i]=(int)(getWidth()/2+(r1[shapeNumber][i]*(Math.cos(120.0/180.0*Math.PI))+r2[shapeNumber][i]*(Math.sin(120.0/180.0*Math.PI))));
            	coords[1][2][i]=(int)(getHeight()/2-(-r1[shapeNumber][i]*(Math.sin(120.0/180.0*Math.PI))+r2[shapeNumber][i]*(Math.cos(120.0/180.0*Math.PI))));
            	coords[0][3][i]=(int)(getWidth()/2+(r1[shapeNumber][i]*(Math.cos(120.0/180.0*Math.PI))-r2[shapeNumber][i]*(Math.sin(120.0/180.0*Math.PI))));
            	coords[1][3][i]=(int)(getHeight()/2-(-r1[shapeNumber][i]*(Math.sin(120.0/180.0*Math.PI))-r2[shapeNumber][i]*(Math.cos(120.0/180.0*Math.PI))));
            	coords[0][4][i]=(int)(getWidth()/2+(r1[shapeNumber][i]*(Math.cos(240.0/180.0*Math.PI))+r2[shapeNumber][i]*(Math.sin(240.0/180.0*Math.PI))));
            	coords[1][4][i]=(int)(getHeight()/2-(-r1[shapeNumber][i]*(Math.sin(240.0/180.0*Math.PI))+r2[shapeNumber][i]*(Math.cos(240.0/180.0*Math.PI))));
            	coords[0][5][i]=(int)(getWidth()/2+(r1[shapeNumber][i]*(Math.cos(240.0/180.0*Math.PI))-r2[shapeNumber][i]*(Math.sin(240.0/180.0*Math.PI))));
            	coords[1][5][i]=(int)(getHeight()/2-(-r1[shapeNumber][i]*(Math.sin(240.0/180.0*Math.PI))-r2[shapeNumber][i]*(Math.cos(240.0/180.0*Math.PI))));
            	//translating the original 6 reflections
            	for (int j=6; j<6*Math.pow(getWidth()/(2*zoom), 2); j++){
            		if (j%6==0){
            				coords[0][j][i]=coords[0][0][i]+(int)((1.5)*(j/6)*zoom);	
            				coords[0][j+10000][i]=coords[0][0][i]-(int)((1.5)*(j/6)*zoom);
            				coords[0][j+20000][i]=coords[0][0][i]-(int)((1.5)*(j/6)*zoom);
            				coords[0][j+30000][i]=coords[0][0][i]+(int)((1.5)*(j/6)*zoom);
            				coords[0][j+40000][i]=coords[0][0][i];
            				coords[0][j+50000][i]=coords[0][0][i];
            				coords[0][j+60000][i]=coords[0][0][i]+3*j/6*zoom;
            				coords[0][j+70000][i]=coords[0][0][i]-3*j/6*zoom;
            				coords[0][j+80000][i]=coords[0][0][i]-(int)((1.5)*(j/6)*zoom);
            				coords[0][j+90000][i]=coords[0][0][i]+(int)((1.5)*(j/6)*zoom);
            				coords[0][j+100000][i]=coords[0][0][i]-(int)((1.5)*(j/6)*zoom);
            				coords[0][j+110000][i]=coords[0][0][i]+(int)((1.5)*(j/6)*zoom);
            				coords[1][j][i]=coords[1][0][i]+j/6*zoom;
            				coords[1][j+10000][i]=coords[1][0][i]-j/6*zoom;
            				coords[1][j+20000][i]=coords[1][0][i]+j/6*zoom;
            				coords[1][j+30000][i]=coords[1][0][i]-j/6*zoom;
            				coords[1][j+40000][i]=coords[1][0][i]+2*(j/6)*zoom;
            				coords[1][j+50000][i]=coords[1][0][i]-2*(j/6)*zoom;
            				coords[1][j+60000][i]=coords[1][0][i];
            				coords[1][j+70000][i]=coords[1][0][i];
            				coords[1][j+80000][i]=coords[1][0][i]+3*(j/6)*zoom;
            				coords[1][j+90000][i]=coords[1][0][i]-3*(j/6)*zoom;
            				coords[1][j+100000][i]=coords[1][0][i]-3*(j/6)*zoom;
            				coords[1][j+110000][i]=coords[1][0][i]+3*(j/6)*zoom;
            		}
            		if (j%6==1){
            			coords[0][j][i]=coords[0][1][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+10000][i]=coords[0][1][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+20000][i]=coords[0][1][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+30000][i]=coords[0][1][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+40000][i]=coords[0][1][i];
        				coords[0][j+50000][i]=coords[0][1][i];
        				coords[0][j+60000][i]=coords[0][1][i]+3*(j/6)*zoom;
        				coords[0][j+70000][i]=coords[0][1][i]-3*(j/6)*zoom;
        				coords[0][j+80000][i]=coords[0][1][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+90000][i]=coords[0][1][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+100000][i]=coords[0][1][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+110000][i]=coords[0][1][i]+(int)((1.5)*(j/6)*zoom);
        				coords[1][j][i]=coords[1][1][i]+j/6*zoom;
        				coords[1][j+10000][i]=coords[1][1][i]-j/6*zoom;
        				coords[1][j+20000][i]=coords[1][1][i]+j/6*zoom;
        				coords[1][j+30000][i]=coords[1][1][i]-j/6*zoom;
        				coords[1][j+40000][i]=coords[1][1][i]+2*(j/6)*zoom;
        				coords[1][j+50000][i]=coords[1][1][i]-2*(j/6)*zoom;
        				coords[1][j+60000][i]=coords[1][1][i];
        				coords[1][j+70000][i]=coords[1][1][i];
        				coords[1][j+80000][i]=coords[1][1][i]+3*(j/6)*zoom;
        				coords[1][j+90000][i]=coords[1][1][i]-3*(j/6)*zoom;
        				coords[1][j+100000][i]=coords[1][1][i]-3*(j/6)*zoom;
        				coords[1][j+110000][i]=coords[1][1][i]+3*(j/6)*zoom;
            		}
            		if (j%6==2){
            			coords[0][j][i]=coords[0][2][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+10000][i]=coords[0][2][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+20000][i]=coords[0][2][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+30000][i]=coords[0][2][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+40000][i]=coords[0][2][i];
        				coords[0][j+50000][i]=coords[0][2][i];
        				coords[0][j+60000][i]=coords[0][2][i]+3*(j/6)*zoom;
        				coords[0][j+70000][i]=coords[0][2][i]-3*(j/6)*zoom;
        				coords[0][j+80000][i]=coords[0][2][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+90000][i]=coords[0][2][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+100000][i]=coords[0][2][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+110000][i]=coords[0][2][i]+(int)((1.5)*(j/6)*zoom);
        				coords[1][j][i]=coords[1][2][i]+j/6*zoom;
        				coords[1][j+10000][i]=coords[1][2][i]-j/6*zoom;
        				coords[1][j+20000][i]=coords[1][2][i]+j/6*zoom;
        				coords[1][j+30000][i]=coords[1][2][i]-j/6*zoom;
        				coords[1][j+40000][i]=coords[1][2][i]+2*(j/6)*zoom;
        				coords[1][j+50000][i]=coords[1][2][i]-2*(j/6)*zoom;
        				coords[1][j+60000][i]=coords[1][2][i];
        				coords[1][j+70000][i]=coords[1][2][i];
        				coords[1][j+80000][i]=coords[1][2][i]+3*(j/6)*zoom;
        				coords[1][j+90000][i]=coords[1][2][i]-3*(j/6)*zoom;
        				coords[1][j+100000][i]=coords[1][2][i]-3*(j/6)*zoom;
        				coords[1][j+110000][i]=coords[1][2][i]+3*(j/6)*zoom;
            		}
            		if (j%6==3){
            			coords[0][j][i]=coords[0][3][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+10000][i]=coords[0][3][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+20000][i]=coords[0][3][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+30000][i]=coords[0][3][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+40000][i]=coords[0][3][i];
        				coords[0][j+50000][i]=coords[0][3][i];
        				coords[0][j+60000][i]=coords[0][3][i]+3*(j/6)*zoom;
        				coords[0][j+70000][i]=coords[0][3][i]-3*(j/6)*zoom;
        				coords[0][j+80000][i]=coords[0][3][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+90000][i]=coords[0][3][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+100000][i]=coords[0][3][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+110000][i]=coords[0][3][i]+(int)((1.5)*(j/6)*zoom);
        				coords[1][j][i]=coords[1][3][i]+j/6*zoom;
        				coords[1][j+10000][i]=coords[1][3][i]-j/6*zoom;
        				coords[1][j+20000][i]=coords[1][3][i]+j/6*zoom;
        				coords[1][j+30000][i]=coords[1][3][i]-j/6*zoom;
        				coords[1][j+40000][i]=coords[1][3][i]+2*(j/6)*zoom;
        				coords[1][j+50000][i]=coords[1][3][i]-2*(j/6)*zoom;
        				coords[1][j+60000][i]=coords[1][3][i];
        				coords[1][j+70000][i]=coords[1][3][i];
        				coords[1][j+80000][i]=coords[1][3][i]+3*(j/6)*zoom;
        				coords[1][j+90000][i]=coords[1][3][i]-3*(j/6)*zoom;
        				coords[1][j+100000][i]=coords[1][3][i]-3*(j/6)*zoom;
        				coords[1][j+110000][i]=coords[1][3][i]+3*(j/6)*zoom;
            		}
            		if (j%6==4){
            			coords[0][j][i]=coords[0][4][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+10000][i]=coords[0][4][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+20000][i]=coords[0][4][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+30000][i]=coords[0][4][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+40000][i]=coords[0][4][i];
        				coords[0][j+50000][i]=coords[0][4][i];
        				coords[0][j+60000][i]=coords[0][4][i]+3*(j/6)*zoom;
        				coords[0][j+70000][i]=coords[0][4][i]-3*(j/6)*zoom;
        				coords[0][j+80000][i]=coords[0][4][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+90000][i]=coords[0][4][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+100000][i]=coords[0][4][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+110000][i]=coords[0][4][i]+(int)((1.5)*(j/6)*zoom);
        				coords[1][j][i]=coords[1][4][i]+j/6*zoom;
        				coords[1][j+10000][i]=coords[1][4][i]-j/6*zoom;
        				coords[1][j+20000][i]=coords[1][4][i]+j/6*zoom;
        				coords[1][j+30000][i]=coords[1][4][i]-j/6*zoom;
        				coords[1][j+40000][i]=coords[1][4][i]+2*(j/6)*zoom;
        				coords[1][j+50000][i]=coords[1][4][i]-2*(j/6)*zoom;
        				coords[1][j+60000][i]=coords[1][4][i];
        				coords[1][j+70000][i]=coords[1][4][i];
        				coords[1][j+80000][i]=coords[1][4][i]+3*(j/6)*zoom;
        				coords[1][j+90000][i]=coords[1][4][i]-3*(j/6)*zoom;
        				coords[1][j+100000][i]=coords[1][4][i]-3*(j/6)*zoom;
        				coords[1][j+110000][i]=coords[1][4][i]+3*(j/6)*zoom;
            		}
            		if (j%6==5){
            			coords[0][j][i]=coords[0][5][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+10000][i]=coords[0][5][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+20000][i]=coords[0][5][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+30000][i]=coords[0][5][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+40000][i]=coords[0][5][i];
        				coords[0][j+50000][i]=coords[0][5][i];
        				coords[0][j+60000][i]=coords[0][5][i]+3*(j/6)*zoom;
        				coords[0][j+70000][i]=coords[0][5][i]-3*(j/6)*zoom;
        				coords[0][j+80000][i]=coords[0][5][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+90000][i]=coords[0][5][i]+(int)((1.5)*(j/6)*zoom);
        				coords[0][j+100000][i]=coords[0][5][i]-(int)((1.5)*(j/6)*zoom);
        				coords[0][j+110000][i]=coords[0][5][i]+(int)((1.5)*(j/6)*zoom);
        				coords[1][j][i]=coords[1][5][i]+j/6*zoom;
        				coords[1][j+10000][i]=coords[1][5][i]-j/6*zoom;
        				coords[1][j+20000][i]=coords[1][5][i]+j/6*zoom;
        				coords[1][j+30000][i]=coords[1][5][i]-j/6*zoom;
        				coords[1][j+40000][i]=coords[1][5][i]+2*(j/6)*zoom;
        				coords[1][j+50000][i]=coords[1][5][i]-2*(j/6)*zoom;
        				coords[1][j+60000][i]=coords[1][5][i];
        				coords[1][j+70000][i]=coords[1][5][i];
        				coords[1][j+80000][i]=coords[1][5][i]+3*(j/6)*zoom;
        				coords[1][j+90000][i]=coords[1][5][i]-3*(j/6)*zoom;
        				coords[1][j+100000][i]=coords[1][5][i]-3*(j/6)*zoom;
        				coords[1][j+110000][i]=coords[1][5][i]+3*(j/6)*zoom;
            		}
        		}
        	}
        	return coords;
        }
        
        
        public void drawReflections(int[][][] coords, Graphics g)
        {
        	for (int i=0; i< coords[0].length; i++){
        		g.fillPolygon(coords[0][i], coords[1][i], coords[0][0].length);
        	}
        }
        public void drawGrid (Graphics g){
        	for (int i=0; i<getHeight(); i=i+zoom){
        		g.drawLine(0,i,getWidth(),i);
        	}
        	for (int i=-getWidth()/4; i<=getWidth()-getWidth()/4; i=i+zoom){
        		g.drawLine(getWidth()-i, 0, getWidth()/2-i, getHeight());
        		g.drawLine(i, 0, getWidth()/2+i, getHeight());
        	}
        }
        
    
        public void paintComponent(Graphics g) {
            if (isOpaque()) { g.setColor(getBackground());
                              g.fillRect(0, 0, getWidth(), getHeight());
            }
            g.setColor(grid);
            drawGrid(g);
            
            
            //g.drawLine(0,getHeight()/2,getWidth(),getHeight()/2);
            //g.drawLine(3*getWidth()/4, 0, getWidth()/4, getHeight());
            //g.drawLine(getWidth()/4, 0, 3*getWidth()/4, getHeight());
            /*c.add(Color.RED);
            c.add(Color.GREEN);
            sides.add(4);
            sides.add(4);*/
            for (int i=0; i<c.size(); i++){
            	g.setColor(c.get(i));
            	drawReflections(getReflections(sides.get(i)), g);
            }
            /*g.setColor(Color.RED);
            drawReflections(getReflections(4), g);
            g.setColor(Color.GREEN);
            drawReflections(getReflections(4), g);*/
            g.setColor(Color.BLACK);
            g.fillPolygon(new int[]{0, 0, getWidth()/4} , new int[]{0, getHeight()/2, 0}, 3);
            g.fillPolygon(new int[]{0, 0, getWidth()/4} , new int[]{getHeight(), getHeight()/2, getHeight()}, 3);
            g.fillPolygon(new int[]{getWidth(), getWidth(), 3*getWidth()/4+5} , new int[]{0, getHeight()/2, 0}, 3);
            g.fillPolygon(new int[]{getWidth(), getWidth(), 3*getWidth()/4+5} , new int[]{getHeight(), getHeight()/2, getHeight()}, 3);
        } // end of paintComponent

    }  // end of CoordinateArea class
    

	@Override
	public void actionPerformed(ActionEvent e) {
		// TODO Auto-generated method stub
		if (e.getSource()==gridBox && grid.equals(Color.BLACK)){
			grid=Color.WHITE;
			shapeNumber=0;
			repaint();
		}
		else if (e.getSource()==gridBox&&grid.equals(Color.WHITE)){
			grid=Color.BLACK;
			shapeNumber=0;
			repaint();
		}
		if (e.getSource()==shakeButton){
			shake();
			shapeNumber=0;
			repaint();
		}
		if (e.getSource()==zoomInButton){
			shapeNumber=0;
			zoom=zoom*2;
			shake();
			repaint();
		}
		if (e.getSource()==zoomOutButton){
			shapeNumber=0;
			zoom=zoom/2;
			shake();
			repaint();
		}
		if (e.getSource()==newShapeButton){
			String[] possibilities = {"BLUE", "CYAN", "DARK_GRAY", "GRAY", "GREEN", "LIGHT_GRAY", "MAGENTA", "ORANGE", "PINK", "RED", "WHITE", "YELLOW"};
            String s =(String) JOptionPane.showInputDialog(
                                frame,
                                "Choose a color:\n",
                                "Customized Dialog",
                                JOptionPane.PLAIN_MESSAGE,
                                icon,
                                possibilities, "BLUE");
            if (s.equals("BLUE"))
            	c.add(Color.BLUE);
            else if (s.equals("CYAN"))
            	c.add(Color.CYAN);
            else if (s.equals("DARK_GRAY"))
            	c.add(Color.DARK_GRAY);
            else if (s.equals("GRAY"))
            	c.add(Color.GRAY);
            else if (s.equals("GREEN"))
            	c.add(Color.GREEN);
            else if (s.equals("LIGHT_GRAY"))
            	c.add(Color.LIGHT_GRAY);
            else if (s.equals("MAGENTA"))
            	c.add(Color.MAGENTA);
            else if (s.equals("ORANGE"))
            	c.add(Color.ORANGE);
            else if (s.equals("PINK"))
            	c.add(Color.PINK);
            else if (s.equals("RED"))
            	c.add(Color.RED);
            else if (s.equals("WHITE"))
            	c.add(Color.WHITE);
            else if (s.equals("YELLOW"))
            	c.add(Color.YELLOW);
            sides.add( Integer.parseInt((String)JOptionPane.showInputDialog(
                    frame,
                    "Number of sides:\n",
                    "Customized Dialog",
                    JOptionPane.PLAIN_MESSAGE,
                    icon,
                    null,
                    "5")));
            repaint();
		}
	} 
	private static void shake(){
        for(int i=0; i < r1.length; i++){
        	for(int j=0; j<r1[0].length; j++){
        		r1[i][j]=(int)(Math.random()*zoom);
        		r2[i][j]=(int)(Math.random()*zoom);
        	}
        }
	}


}

